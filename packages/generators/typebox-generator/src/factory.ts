import { join } from "node:path";

import {
  defaults,
  type GeneratorFactory,
  pathResolver,
  type RouteResolverEntry,
  renderToFile,
  typeboxLiteralText,
} from "@amperjs/devlib";

import errorHandlerTpl from "./error-handler.ts?as=text";
import type { Options } from "./types";

import libTpl from "./templates/lib.hbs";
import schemasTpl from "./templates/schemas.hbs";

export const factory: GeneratorFactory<Options> = async (
  pluginoptions,
  options,
) => {
  const { appRoot, sourceFolder, formatters } = pluginoptions;
  const { validationMessages = {}, importCustomTypes } = { ...options };

  const { resolve } = pathResolver({ appRoot, sourceFolder });

  for (const [file, template] of [
    ["index.ts", libTpl],
    ["error-handler.ts", errorHandlerTpl],
  ]) {
    await renderToFile(
      resolve("libDir", `{typebox}/${file}`),
      template,
      {
        validationMessages: JSON.stringify(validationMessages),
        importPathmap: {
          customTypes: importCustomTypes,
        },
      },
      { formatters },
    );
  }

  const generateLibFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "api") {
        continue;
      }

      await renderToFile(
        resolve("apiLibDir", route.importPath, "schemas.ts"),
        schemasTpl,
        {
          route,
          routeMethods: route.methods.map((method) => {
            return {
              method,
              payloadType: route.payloadTypes.find((e) => e.method === method),
              responseType: route.responseTypes.find(
                (e) => e.method === method,
              ),
            };
          }),
          resolvedTypes: [
            route.params.resolvedType,
            ...route.payloadTypes.flatMap((e) =>
              e.resolvedType ? [e.resolvedType] : [],
            ),
            ...route.responseTypes.flatMap((e) =>
              e.resolvedType ? [e.resolvedType] : [],
            ),
          ].flatMap((resolvedType) => {
            return resolvedType
              ? [
                  {
                    ...resolvedType,
                    text: typeboxLiteralText(resolvedType.text, pluginoptions),
                  },
                ]
              : [];
          }),
          importPathmap: {
            typebox: join(defaults.appPrefix, defaults.libDir, "{typebox}"),
          },
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
    },
  };
};
