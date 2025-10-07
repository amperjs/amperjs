import {
  type GeneratorConstructor,
  pathResolver,
  renderToFile,
} from "@oreum/devlib";

import schemasTpl from "./templates/schemas.hbs";

/**
 * Generates stub files required by various generators.
 * Ensures cross-generator dependencies remain resolvable
 * even if specialized generators supposed to generate these files are not installed.
 * */
export default (): GeneratorConstructor => {
  return {
    name: "Stub",
    moduleImport: import.meta.filename,
    moduleConfig: undefined,
    async factory({ appRoot, sourceFolder }) {
      return {
        async watchHandler(entries) {
          const { resolve } = pathResolver({ appRoot, sourceFolder });
          for (const { kind, route } of entries) {
            if (kind === "api") {
              // Generating stub schemas file.
              // It is required by various generators, e.g. api-generator, fetch-generator.
              // Specialized generators (e.g. typebox-generator) may override this later.
              renderToFile(
                resolve("apiLibDir", route.importPath, "schemas.ts"),
                schemasTpl,
                { route },
                { overwrite: false },
              );
            }
          }
        },
      };
    },
  };
};
