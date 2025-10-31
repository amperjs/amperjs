---
title: Vite Plugins - Dev Plugin
description: Vite Plugins - Dev Plugin
---

### ⚙️ The DevPlugin

The DevPlugin is the default export from `@kappajs/dev` and accepts two arguments:

The first argument is the API URL (typically imported from your `config/index.ts`),
which tells the plugin where API routes should be mounted.

The second argument is a `PluginOptions` object:

```ts
export type PluginOptions = {
  generators?: Array<GeneratorConstructor>;
  formatters?: Array<FormatterConstructor>;
};
```

**Generators** are functions that produce code based on your route structure and types.
Common generators include:

- `apiGenerator()` - Generates route helpers and type definitions for API endpoints
- `fetchGenerator()` - Generates typed fetch clients for consuming your API
- `typeboxGenerator()` - Generates runtime validation schemas from TypeScript types
- `solidGenerator()` - Generates SolidJS routing and component scaffolding

You configure generators by adding them to the array:

```ts [vite.config.ts]
import devPlugin, {
  apiGenerator,
  fetchGenerator
} from "@kappajs/dev";
import typeboxGenerator from "@kappajs/typebox-generator";
import solidGenerator from "@kappajs/solid-generator";

plugins: [
  devPlugin(apiurl, {
    generators: [
      apiGenerator(),
      fetchGenerator(),
      typeboxGenerator(),
      solidGenerator(),
    ],
  }),
]
```

The order doesn't typically matter —
each generator watches for its relevant files and runs independently.

**Formatters** ensure that generated code matches your project's formatting conventions.
This is important because generated code should pass your linters
without manual intervention.

The most common formatter is the Biome formatter:

```ts [vite.config.ts]
import biomeFormatter from "@kappajs/biome-formatter";

const biomeConfig = {
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
};

export default defineConfig(import.meta.dirname, {
  base: join(baseurl, "/"),
  server: {
    port: 4000,
  },
  plugins: [
    devPlugin(apiurl, {
      generators: [apiGenerator(), fetchGenerator()],
      formatters: [
        // add your formatter(s) here
        biomeFormatter(biomeConfig),
      ],
    }),
  ],
});
```

The formatter receives your Biome configuration
and applies it to all generated code before writing files.

You can use other formatters like Prettier by implementing the formatter interface.
Formatters are optional — if you don't provide any,
code is generated with default formatting.

