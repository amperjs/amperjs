import {
  type GeneratorConstructor,
  pathResolver,
  renderToFile,
} from "@oreum/devlib";

import { factory } from "./factory";
import type { Options } from "./types";

import typeboxTpl from "./templates/typebox.hbs";

export default (options?: Options | undefined): GeneratorConstructor => {
  const { refineTypeName = "TRefine" } = { ...options };
  const refineTypeRegex = new RegExp(`\\b${refineTypeName}\\s*<`, "g");

  return {
    name: "TypeBox",
    moduleImport: import.meta.filename,
    moduleConfig: options,
    factory: (...args) => factory(...args, { ...options, refineTypeName }),
    options: {
      resolveTypes: true,
      async typesResolved(resolvedTypes, routeEntry, { options }) {
        const { resolve } = pathResolver(options);
        await renderToFile(
          resolve("apiLibDir", routeEntry.importPath, "typebox.ts"),
          typeboxTpl,
          {
            resolvedTypes: resolvedTypes.map(({ name, text }) => {
              return {
                name,
                text: text
                  /**
                   * TypeBox's built-in `Options` type is not configurable.
                   * To allow a custom type name, exposing `refineTypeName` option,
                   * defaulted to TRefine, then renaming `refineTypeName` to `Options`.
                   * */
                  .replace(refineTypeRegex, "Options<")
                  // escaping backticks and $ to avoid syntax issues
                  .replace(/(?<!\\)`/g, "\\`")
                  .replace(/(?<!\\)\$\{/g, "\\${")
                  .trim(),
              };
            }),
          },
        );
      },
    },
  };
};
