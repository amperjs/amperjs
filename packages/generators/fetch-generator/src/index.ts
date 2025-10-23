import type { GeneratorConstructor } from "@amperjs/devlib";

import { factory } from "./factory";

export default (): GeneratorConstructor => {
  return {
    name: "Fetch",
    moduleImport: import.meta.filename,
    moduleConfig: undefined,
    factory,
  };
};
