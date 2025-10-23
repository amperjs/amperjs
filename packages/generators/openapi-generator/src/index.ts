import type { GeneratorConstructor } from "@amperjs/devlib";

import { factory } from "./factory";
import type { Options } from "./types";

export default (openapiOptions: Options): GeneratorConstructor => {
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
