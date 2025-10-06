import { join } from "node:path";

import crc from "crc/crc32";
import picomatch, { type Matcher } from "picomatch";

import {
  type ApiRoute,
  defaults,
  type GeneratorFactory,
  type PathToken,
  pathResolver,
  pathTokensFactory,
  type RouteResolverEntry,
  renderToFile,
} from "@oreum/devlib";

import type { Options } from "./types";

import indexTpl from "./templates/index.hbs";
import routeLibIndexTpl from "./templates/route/index.hbs";
import routePublicTpl from "./templates/route.hbs";

export const factory: GeneratorFactory<Options> = async (
  { appRoot, sourceFolder, formatters },
  { alias, templates, meta },
) => {
  const { resolve } = pathResolver({ appRoot, sourceFolder });

  const customTemplates: Array<[Matcher, string]> = Object.entries(
    templates || {},
  ).map(([pattern, template]) => [picomatch(pattern), template]);

  const metaMatchers: Array<[Matcher, unknown]> = Object.entries(
    meta || {},
  ).map(([pattern, meta]) => [picomatch(pattern), meta]);

  const resolveMeta = ({ name }: ApiRoute) => {
    const match = metaMatchers.find(([isMatch]) => isMatch(name));
    return Object.prototype.toString.call(match?.[1]) === "[object Object]"
      ? JSON.stringify(match?.[1])
      : undefined;
  };

  const generatePublicFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "api") {
        continue;
      }

      const customTemplate = customTemplates.find(([isMatch]) => {
        return isMatch(route.name);
      });

      await renderToFile(
        resolve("apiDir", route.file),
        customTemplate?.[1] || routePublicTpl,
        {
          route,
          importPathmap: {
            lib: join(sourceFolder, defaults.apiLibDir, route.importPath),
          },
        },
        {
          // write only to blank files
          overwrite: (content) => content?.trim().length === 0,
          formatters,
        },
      );
    }
  };

  return {
    async watchHandler(entries, event) {
      if (event) {
        const relatedEntries = entries.filter(({ kind, route }) => {
          return kind === "api" //
            ? route.fileFullpath === event.file
            : false;
        });
        if (event.kind === "create") {
          await generatePublicFiles(relatedEntries);
        }
      } else {
        // no event means initial call
        await generatePublicFiles(entries);
      }

      await generateIndexFiles(entries);
    },
  };
};
