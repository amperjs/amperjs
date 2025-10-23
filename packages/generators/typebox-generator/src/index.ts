import type { GeneratorConstructor } from "@amperjs/devlib";

import { factory } from "./factory";
import type { Options } from "./types";

export default (options?: Options): GeneratorConstructor => {
  return {
    name: "TypeBox",
    moduleImport: import.meta.filename,
    moduleConfig: options,
    factory: (...args) => factory(...args, { ...options }),
    options: {
      resolveTypes: true,
    },
  };
};
