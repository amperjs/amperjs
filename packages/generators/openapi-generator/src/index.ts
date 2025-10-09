import type { GeneratorConstructor } from "@oreum/devlib";

import { factory, type OpenapiOptions } from "./factory";

export default (openapiOptions: OpenapiOptions): GeneratorConstructor => {
  return {
    name: "OpenApi",
    moduleImport: import.meta.filename,
    moduleConfig: openapiOptions,
    factory: (options) => factory(options, openapiOptions),
    options: {
      resolveTypes: true,
    },
  };
};
