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
};
