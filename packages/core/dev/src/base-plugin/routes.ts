import { dirname, join, resolve } from "node:path";

import crc from "crc/crc32";
import picomatch from "picomatch";
import { glob } from "tinyglobby";
import { flattener } from "ts-fusion";

import {
  type ApiRoute,
  defaults,
  type GeneratorConstructor,
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
  } = pluginOptions;

  const project = createProject({
    tsConfigFilePath: resolve(appRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  let resolveTypes = false;

  const typesResolvedHooks: Array<
    NonNullable<NonNullable<GeneratorConstructor["options"]>["typesResolved"]>
  > = [];

  for (const { options } of generators) {
    if (options?.resolveTypes) {
      resolveTypes = true;
      if (options.typesResolved) {
        typesResolvedHooks.push(options.typesResolved);
      }
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
      overrides: { ...overrides },
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
};
