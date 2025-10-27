import { dirname, join, resolve } from "node:path";

import crc from "crc/crc32";
import picomatch from "picomatch";
import { glob } from "tinyglobby";

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
} from "@amperjs/devlib";

import { resolveRouteSignature, typeResolverFactory } from "./ast";
import { cacheFactory } from "./cache";

import resolvedTypesTpl from "./templates/resolved-types.hbs";
import typesFileTpl from "./templates/types.hbs";

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

  let resolveTypes = false;

  for (const { options } of generators) {
    if (options?.resolveTypes) {
      resolveTypes = true;
    }
  }

  const {
    //
    literalTypesResolver,
    getSourceFile,
    refreshSourceFile,
  } = typeResolverFactory(pluginOptions);

  const routeFilePatterns = [
    `${defaults.apiDir}/**/index.ts`,
    `${defaults.pagesDir}/**/index.{ts,tsx,vue,svelte}`,
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
          resolvedType: undefined,
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
            await refreshSourceFile(fileFullpath);
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
              sourceFile: getSourceFile(fileFullpath),
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

          const typesFile = pathResolver({ appRoot, sourceFolder }).resolve(
            "apiLibDir",
            importPath,
            "types.ts",
          );

          const typesFileContent = render(typesFileTpl, {
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
            ? literalTypesResolver(typesFileContent, {
                overrides: [...payloadTypes, ...responseTypes].reduce(
                  (map: Record<string, string>, { id, skipValidation }) => {
                    if (skipValidation) {
                      map[id] = "never";
                    }
                    return map;
                  },
                  { [refineTypeName]: refineTypeName },
                ),
                withProperties: [params.id, ...payloadTypes.map((e) => e.id)],
                formatters,
              })
            : undefined;

          /**
           * Writing types.ts file; required by core generators (like fetch).
           * If types resolved, write resolved types;
           * otherwise write original types extracted from API route.
           * */
          await renderToFile(
            typesFile,
            resolvedTypes ? resolvedTypesTpl : typesFileContent,
            { resolvedTypes },
          );

          params.resolvedType = resolvedTypes?.find(
            (e) => e.name === params.id,
          );

          cache = await persistCache({
            params,
            methods,
            typeDeclarations,
            numericParams,
            // text was needed at writing types.ts file, dropping from cache
            payloadTypes: payloadTypes.map(({ text, ...rest }) => {
              return {
                ...rest,
                resolvedType: resolvedTypes?.find((e) => e.name === rest.id),
              };
            }),
            responseTypes: responseTypes.map(({ text, ...rest }) => {
              return {
                ...rest,
                resolvedType: resolvedTypes?.find((e) => e.name === rest.id),
              };
            }),
            referencedFiles,
          });
        }

        const {
          methods,
          typeDeclarations,
          numericParams,
          payloadTypes,
          responseTypes,
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
