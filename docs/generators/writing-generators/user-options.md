---
title: Generator User Options
description: Make generators configurable by defining options types that users can pass through Vite config for custom output paths, formats, and behavior.
head:
  - - meta
    - name: keywords
      content: generator options, plugin configuration, user config, generator settings, configurable generators, vite config
---

To make your generator configurable, define an options type
and pass it through the default function:

```ts
export type Options = {
  outfile: string;
  format?: "json" | "yaml";
  includeExamples?: boolean;
};

export default (options?: Options): GeneratorConstructor => {
  return {
    name: "MyGenerator",
    moduleImport: import.meta.filename,
    moduleConfig: options,
    factory: (...args) => factory(...args, options),
  };
};
```

Users configure your generator when adding it to their Vite config:

```ts
import myGenerator from "@my/generator";

export default {
  plugins: [
    devPlugin(apiurl, {
      generators: [
        myGenerator({
          outfile: "output.json",
          includeExamples: true,
        }),
      ],
    }),
  ],
}
```

