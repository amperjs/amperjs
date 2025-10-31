---
title: Generators - OpenAPI
description: Generators - OpenAPI
---

`KappaJS` can automatically generate OpenAPI 3.1 specifications from your API routes.

The generator analyzes your route structure, type definitions, and validation schemas
to produce a complete, standards-compliant OpenAPI spec.

### Installation

::: code-group

```sh [npm]
npm install -D @kappajs/openapi-generator
```

```sh [pnpm]
pnpm install -D @kappajs/openapi-generator
```

```sh [yarn]
yarn add -D @kappajs/openapi-generator
```
:::

Add the OpenAPI generator to your source folder's `vite.config.ts`:

```typescript
import devPlugin from "@kappajs/dev";
import openapiGenerator from "@kappajs/openapi-generator";

export default {
  plugins: [
    devPlugin(apiurl, {
      generators: [
        openapiGenerator({
          outfile: "openapi.json",
          openapi: "3.1.0",
          info: {
            title: "My API",
            version: "1.0.0",
            description: "API documentation for My App",
          },
          servers: [
            {
              url: "http://localhost:4000",
              description: "Development server"
            }
          ],
        }),
        // other generators
      ],
    }),
  ],
}
```

