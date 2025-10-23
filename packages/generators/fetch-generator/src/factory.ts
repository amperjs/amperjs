import { join } from "node:path";

import {
  defaults,
  type GeneratorFactory,
  pathResolver,
  type RouteResolverEntry,
  renderToFile,
} from "@amperjs/devlib";

import fetchTpl from "./templates/fetch.hbs";
import indexTpl from "./templates/index.hbs";
import libTpl from "./templates/lib.hbs";
import typesTpl from "./templates/types.hbs";
import unwrapTpl from "./templates/unwrap.hbs";

export const factory: GeneratorFactory = async ({
  appRoot,
  sourceFolder,
  formatters,
}) => {
  const { resolve } = pathResolver({ appRoot, sourceFolder });

  for (const [file, template] of [
    // These files supposed to be replaced by specialized generators,
    // so write them only during initialization.
    ["unwrap.ts", unwrapTpl],
  ]) {
    await renderToFile(
      resolve("fetchLibDir", file),
      template,
      {},
      { formatters },
    );
  }

  const generateLibFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "api") {
        continue;
      }

      await renderToFile(
        resolve("apiLibDir", route.importPath, "fetch.ts"),
        fetchTpl,
        {
          route,
          routeMethods: route.methods.map((method) => {
            const payloadType = route.payloadTypes.find(
              (e) => e.method === method,
            );
            const responseType = route.responseTypes.find(
              (e) => e.method === method,
            );
            return {
              method,
              payloadType,
              responseType,
            };
          }),
          paramsMapper: route.params.schema.map(({ name }, idx) => ({
            name,
            idx,
          })),
          importPathmap: {
            core: join(defaults.appPrefix, defaults.coreDir),
            config: join(sourceFolder, defaults.configDir),
            fetchLib: join(sourceFolder, defaults.fetchLibDir, "lib"),
          },
        },
        { formatters },
      );
    }
  };

  const generateIndexFiles = async (entries: Array<RouteResolverEntry>) => {
    const routes = entries
      .flatMap(({ kind, route }) => (kind === "api" ? [route] : []))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const [file, template] of [
      ["index.ts", indexTpl],
      ["lib.ts", libTpl],
      ["types.ts", typesTpl],
    ]) {
      await renderToFile(
        resolve("fetchLibDir", file),
        template,
        {
          routes: routes.map((route) => {
            return {
              ...route,
              importPathmap: {
                fetchApi: join(
                  sourceFolder,
                  defaults.apiLibDir,
                  route.importPath,
                  "fetch",
                ),
              },
            };
          }),
        },
        { formatters },
      );
    }
  };

  return {
    async watchHandler(entries, event) {
      if (event) {
        if (event.kind === "update") {
          await generateLibFiles(
            entries.filter(({ kind, route }) => {
              return kind === "api"
                ? route.fileFullpath === event.file ||
                    route.referencedFiles?.includes(event.file)
                : false;
            }),
          );
        }
      } else {
        // no event means initial call
        await generateLibFiles(entries);
      }

      await generateIndexFiles(entries);

      return undefined;
    },
  };
};
