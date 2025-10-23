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
} from "@amperjs/devlib";

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

  const generateLibFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "api") {
        continue;
      }

      const context = {
        route,
        params: route.params.schema,
      };

      for (const [file, template] of [
        //
        ["index.ts", routeLibIndexTpl],
      ]) {
        await renderToFile(
          resolve("apiLibDir", route.importPath, file),
          template,
          context,
          { formatters },
        );
      }
    }
  };

  const staticSegments = (pathTokens: Array<PathToken>) => {
    return pathTokens.reduce((a, e) => a + (e.param ? 0 : 1), 0);
  };

  const generateIndexFiles = async (entries: Array<RouteResolverEntry>) => {
    const routes = entries
      .flatMap(({ kind, route }) => {
        if (kind !== "api") {
          return [];
        }

        const baseRoute = {
          ...route,
          path: pathFactory(route.pathTokens),
          meta: resolveMeta(route),
          importPathmap: {
            api: join(sourceFolder, defaults.apiDir, route.importPath),
            schemas: join(
              sourceFolder,
              defaults.apiLibDir,
              route.importPath,
              "schemas",
            ),
          },
        };

        const aliases = Object.entries(alias || {}).flatMap(
          ([url, routeName]) => {
            const pathTokens = pathTokensFactory(url);
            return routeName === route.name
              ? [
                  {
                    ...baseRoute,
                    name: url,
                    importName: `${baseRoute.importName}_${crc(url)}`,
                    fullpath: pathFactory(pathTokens),
                    pathTokens,
                  },
                ]
              : [];
          },
        );

        return [baseRoute, ...aliases];
      })
      .sort((a, b) => {
        /**
         * Sort routes so that more specific (static) paths come before dynamic ones.
         *
         * This is important because dynamic segments (e.g., `:id`) are more general,
         * and can match values that should be routed to more specific static paths.
         *
         * For example, given:
         *   - `/users/account`
         *   - `/users/:id`
         * If `/users/:id` comes first, visiting `/users/account` would incorrectly match it,
         * treating "account" as an `id`. So static routes must take precedence.
         *
         * Estimating by counting static segments (does not start with `:`).
         * The route with more static segments is considered more specific.
         * */
        const aStaticSegments = staticSegments(a.pathTokens);
        const bStaticSegments = staticSegments(b.pathTokens);
        return aStaticSegments === bStaticSegments
          ? a.path.localeCompare(b.path)
          : bStaticSegments - aStaticSegments;
      });

    await renderToFile(
      resolve("libDir", sourceFolder, `${defaults.apiLibDir}.ts`),
      indexTpl,
      {
        routes,
        importPathmap: {
          config: join(sourceFolder, defaults.configDir),
          coreMiddleware: join(sourceFolder, defaults.apiDir, "use"),
        },
      },
      { formatters },
    );
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
          await generateLibFiles(relatedEntries);
        } else if (event.kind === "update") {
          await generateLibFiles(relatedEntries);
        }
      } else {
        // no event means initial call
        await generatePublicFiles(entries);
        await generateLibFiles(entries);
      }

      await generateIndexFiles(entries);
    },
  };
};

export const pathFactory = (pathTokens: Array<PathToken>) => {
  return pathTokens
    .flatMap(({ param, orig, ext }, i) => {
      if (param) {
        if (param.isRest) {
          return `{*${param.name}}${ext}`;
        }
        if (param.isOptional) {
          return `{/:${param.name}${ext}}`;
        }
        return `:${param.name}${ext}`;
      }
      if (i === 0) {
        return orig === "index" ? [] : [orig];
      }
      return [orig];
    })
    .join("/")
    .replace(/\n+/g, "")
    .replace(/\+/g, "\\\\+");
};
