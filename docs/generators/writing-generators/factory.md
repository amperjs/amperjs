---
title: Generator Factory Function
description: Initialize generators with the factory function that receives plugin options and returns a watch handler for processing route entries and generating files.
head:
  - - meta
    - name: keywords
      content: generator factory, plugin options, watch handler, code generation, formatters, generator initialization, route processing
---

The factory function initializes your generator and returns a watch handler:

```ts
import type { GeneratorFactory } from "@kappajs/devlib";
import type { Options } from "./index";

export const factory: GeneratorFactory<Options> = async (
  pluginOptions,
  generatorOptions
) => {
  const { appRoot, sourceFolder, formatters } = pluginOptions;

  // Perform initialization
  // Set up paths, prepare templates, etc.

  return {
    async watchHandler(entries, event) {
      // Process route entries and generate files
    },
  };
};
```

The factory receives two arguments:

**pluginOptions** (`PluginOptionsResolved`) - Options passed to the dev plugin,
shared across all generators:
- `baseurl` - Base URL for this source folder
- `apiurl` - API URL prefix
- `appRoot` - Absolute path to project root
- `sourceFolder` - Name of the source folder being processed
- `outDir` - Build output directory
- `formatters` - Array of code formatters to apply
- `refineTypeName` - Name used for type refinements (default: "TRefine")
- `watcher` - File watcher configuration

**generatorOptions** - Your generator's specific options (second generic parameter).
Can be `undefined` if your generator doesn't accept options.

