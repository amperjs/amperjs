import { dirname, join, resolve } from "node:path";

import crc from "crc/crc32";
import picomatch from "picomatch";
import { glob } from "tinyglobby";
import { flattener } from "ts-fusion";

import {
  type ApiRoute,
  defaults,
  type PageRoute,
  type PluginOptionsResolved,
  pathResolver,
  pathTokensFactory,
  type RouteEntry,
  type RouteResolver,
  render,
  renderToFile,
} from "@oreum/devlib";

import { createProject, resolveRouteSignature } from "./ast";
import { cacheFactory } from "./cache";

import resolvedTypesTpl from "./templates/resolved-types.hbs";
import typeLiteralsTpl from "./templates/type-literals.hbs";

export type Resolvers = Map<string, RouteResolver>;

export type ResolveRouteFile = (file: string) =>
  | [
      // Either `apiDir` or `pagesDir`
      folder: string,
      // Path to a file within the folder, nested at least one level deep
      file: string,
    ]
  | undefined;

export type ResolversFactory = (
  routeFiles: Array<string>,
) => Map<string, RouteResolver>;

export default async (
  pluginOptions: PluginOptionsResolved,
): Promise<{
  resolvers: Resolvers;
  resolversFactory: ResolversFactory;
  resolveRouteFile: ResolveRouteFile;
}> => {
  const {
    appRoot,
    sourceFolder,
    generators = [],
    formatters = [],
    refineTypeName,
  } = pluginOptions;

  const project = createProject({
    tsConfigFilePath: resolve(appRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  let resolveTypes = false;

  for (const { options } of generators) {
    if (options?.resolveTypes) {
      resolveTypes = true;
    }
  }

  const typesResolver = (
    typesFileContent: string,
    overrides?: Record<string, string>,
  ) => {
    const sourceFile = project.createSourceFile(
      `${crc(typesFileContent)}-${Date.now()}.ts`,
      typesFileContent,
      { overwrite: true },
    );

    const resolvedTypes = flattener(project, sourceFile, {
      overrides: { ...overrides, [refineTypeName]: refineTypeName },
      stripComments: true,
    });

    project.removeSourceFile(sourceFile);

    return resolvedTypes;
  };

  const routeFilePatterns = [
    `${defaults.apiDir}/**/index.ts`,
    `${defaults.pagesDir}/**/index.ts{x,}`, // .tsx? wont work here
  ];

  const resolveRouteFile: ResolveRouteFile = (file) => {
    const [_sourceFolder, folder, ...rest] = resolve(appRoot, file)
      .replace(`${appRoot}/`, "")
      .split("/");

    /**
     * Ensure the file:
     * - is under the correct source root (`sourceFolder`)
     * - belongs to a known route folder (`apiDir` or `pagesDir`)
     * - is nested at least one level deep (not a direct child of the folder)
     */
    if (!folder || _sourceFolder !== sourceFolder || rest.length < 2) {
      return;
    }

    return picomatch.isMatch(join(folder, ...rest), routeFilePatterns)
      ? [folder, rest.join("/")]
      : undefined;
  };

  const resolversFactory: ResolversFactory = (routeFiles) => {
    const resolvers = new Map<
      string, // fileFullpath
      RouteResolver
    >();

    const entries: Array<RouteEntry> = routeFiles.flatMap((_file) => {
      const resolvedPaths = resolveRouteFile(_file);

      if (!resolvedPaths) {
        return [];
      }

      const [folder, file] = resolvedPaths;

      const fileFullpath = join(appRoot, sourceFolder, folder, file);

      const pathTokens = pathTokensFactory(dirname(file));

      const name = pathTokens.map((e) => e.orig).join("/");

      const importPath = dirname(file);

      const importName = [
        importPath
          .split(/\[/)[0]
          .replace(/^\W+|\W+$/g, "")
          .replace(/\W+/g, "_"),
        crc(importPath),
      ].join("_");

      return [
        {
          name,
          folder,
          file,
          fileFullpath,
          pathTokens,
          importPath,
          importName,
        },
      ];
    });

    for (const entry of entries.filter((e) => e.folder === defaults.apiDir)) {
      const {
        name,
        file,
        folder,
        fileFullpath,
        pathTokens,
        importPath,
        importName,
      } = entry;

      const handler: RouteResolver["handler"] = async (updatedFile) => {
        const paramsSchema = pathTokens.flatMap((e) => {
          return e.param ? [e.param] : [];
        });

        const params: ApiRoute["params"] = {
          id: ["ParamsT", crc(name)].join(""),
          schema: paramsSchema,
        };

        const optionalParams = paramsSchema.length
          ? !paramsSchema.some((e) => e.isRequired)
          : true;

        const { getCache, persistCache } = cacheFactory(
          { file, fileFullpath, importName, importPath },
          {
            appRoot,
            sourceFolder,
            extraContext: { resolveTypes },
          },
        );

        let cache = await getCache({ validate: true });

        if (!cache) {
          if (updatedFile === fileFullpath) {
            const sourceFile = project.getSourceFile(fileFullpath);
            if (sourceFile) {
              await sourceFile.refreshFromFileSystem();
            }
          }

          const {
            typeDeclarations,
            paramsRefinements,
            methods,
            payloadTypes,
            responseTypes,
            referencedFiles = [],
          } = await resolveRouteSignature(
            { importName, fileFullpath, optionalParams },
            {
              withReferencedFiles: true,
              sourceFile:
                project.getSourceFile(fileFullpath) ||
                project.addSourceFileAtPath(fileFullpath),
              relpathResolver(path) {
                return join(sourceFolder, defaults.apiDir, dirname(file), path);
              },
            },
          );

          const numericParams = paramsRefinements
            ? paramsRefinements.flatMap(({ text, index }) => {
                if (text === "number") {
                  const param = paramsSchema.at(index);
                  return param ? [param.name] : [];
                }
                return [];
              })
            : [];

          const typesFileContent = render(typeLiteralsTpl, {
            params,
            paramsSchema: paramsSchema.map((param, index) => {
              return {
                ...param,
                refinement: paramsRefinements?.at(index),
              };
            }),
            typeDeclarations,
            payloadTypes,
            responseTypes,
          });

          const resolvedTypes = resolveTypes
            ? typesResolver(
                typesFileContent,
                [...payloadTypes, ...responseTypes].reduce(
                  (map: Record<string, string>, { id, skipValidation }) => {
                    if (skipValidation) {
                      map[id] = "never";
                    }
                    return map;
                  },
                  {},
                ),
              )
            : undefined;

          /*
           * writing types.ts file; required by core generators (like fetch).
           * if types resolved, write resolved types;
           * otherwise write original types extracted from API route.
           * */
          await renderToFile(
            pathResolver({ appRoot, sourceFolder }).resolve(
              "apiLibDir",
              importPath,
              "types.ts",
            ),
            resolvedTypes ? resolvedTypesTpl : typesFileContent,
            { resolvedTypes },
            { formatters },
          );

          cache = await persistCache({
            methods,
            typeDeclarations,
            numericParams,
            // text was needed at writing types.ts file, dropping from cache
            payloadTypes: payloadTypes.map(({ text, ...rest }) => rest),
            responseTypes: responseTypes.map(({ text, ...rest }) => rest),
            referencedFiles,
            resolvedTypes,
          });
        }

        const {
          methods,
          typeDeclarations,
          numericParams,
          payloadTypes,
          responseTypes,
          resolvedTypes,
          referencedFiles,
        } = cache;

        const route: ApiRoute = {
          name,
          pathTokens,
          params,
          numericParams,
          optionalParams,
          importName,
          importPath,
          folder,
          file,
          fileFullpath,
          methods,
          typeDeclarations,
          payloadTypes,
          responseTypes,
          resolvedTypes: resolvedTypes
            ? resolvedTypes.map((type) => {
                return {
                  ...type,
                  escapedText: type.text
                    // Escapes backticks and $ for safe use in template literals
                    .replace(/(?<!\\)`/g, "\\`")
                    .replace(/(?<!\\)\$\{/g, "\\${"),
                };
              })
            : undefined,
          referencedFiles: Object.keys(referencedFiles).map(
            // expanding referenced files path,
            // they are stored as relative in cache
            (e) => resolve(appRoot, e),
          ),
        };

        return {
          kind: "api",
          route,
        };
      };

      resolvers.set(fileFullpath, { name, handler });
    }

    for (const entry of entries.filter((e) => e.folder === defaults.pagesDir)) {
      const {
        //
        name,
        folder,
        file,
        fileFullpath,
        pathTokens,
        importPath,
        importName,
      } = entry;

      const handler: RouteResolver["handler"] = async () => {
        const route: PageRoute = {
          name,
          pathTokens,
          params: {
            schema: pathTokens.flatMap((e) => (e.param ? [e.param] : [])),
          },
          folder,
          file,
          fileFullpath,
          importPath,
          importName,
        };

        return {
          kind: "page",
          route,
        };
      };

      resolvers.set(fileFullpath, { name, handler });
    }

    return resolvers;
  };

  const routeFiles = await glob(routeFilePatterns, {
    cwd: resolve(appRoot, sourceFolder),
    absolute: true,
    onlyFiles: true,
    ignore: [
      `${defaults.apiDir}/index.ts`,
      `${defaults.pagesDir}/index.ts{x,}`,
    ],
  });

  return {
    resolvers: resolversFactory(routeFiles),
    resolversFactory,
    resolveRouteFile,
  };
};
