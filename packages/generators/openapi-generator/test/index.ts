import { resolve } from "node:path";

import formatter from "@kappajs/biome-formatter";
import type { PluginOptionsResolved } from "@kappajs/devlib";

export const appRoot = resolve(import.meta.dirname, "@fixtures/app");

export const openapiOptions = {
  openapi: "3.1.0",
  info: {
    title: "test",
    version: "0.0.0",
  },
  servers: [{ url: "http://localhost:8080" }],
};

export const resolvedOptions: PluginOptionsResolved = {
  generators: [
    // providing a stub generator with options.resolveTypes
    {
      name: "",
      moduleConfig: {},
      moduleImport: "",
      async factory() {
        return { async watchHandler() {} };
      },
      options: { resolveTypes: true },
    },
  ],
  formatters: [
    formatter({
      formatter: {
        indentStyle: "space",
        indentWidth: 2,
      },
    }).formatter,
  ],
  refineTypeName: "TRefine",
  watcher: { delay: 0 },
  baseurl: "",
  apiurl: "",
  appRoot,
  sourceFolder: "@src",
  outDir: "_dist",
};
