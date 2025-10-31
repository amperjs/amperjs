---
title: Writing Generators - Example
description: Writing Generators - Example
---

### Fetch Generator as Example

Here's a simplified version of `KappaJS`'s fetch generator to illustrate the patterns:

```ts [index.ts]
import type { GeneratorConstructor } from "@kappajs/devlib";
import { factory } from "./factory";

export default (): GeneratorConstructor => {
  return {
    name: "Fetch",
    moduleImport: import.meta.filename,
    moduleConfig: undefined,
    factory,
  };
};
```

```ts [factory.ts]
import type { GeneratorFactory, RouteResolverEntry } from "@kappajs/devlib";
import { pathResolver, renderToFile } from "@kappajs/devlib";
import fetchTpl from "./templates/fetch.hbs";
import indexTpl from "./templates/index.hbs";

export const factory: GeneratorFactory = async ({
  appRoot,
  sourceFolder,
  formatters,
}) => {
  const { resolve } = pathResolver({ appRoot, sourceFolder });

  const generateRouteFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "api") continue;

      await renderToFile(
        resolve("apiLibDir", route.importPath, "fetch.ts"),
        fetchTpl,
        {
          route,
          methods: route.methods.map((method) => ({
            method,
            payloadType: route.payloadTypes.find(p => p.method === method),
            responseType: route.responseTypes.find(r => r.method === method),
          })),
        },
        { formatters }
      );
    }
  };

  const generateIndexFile = async (entries: Array<RouteResolverEntry>) => {
    const routes = entries
      .filter(({ kind }) => kind === "api")
      .map(({ route }) => route);

    await renderToFile(
      resolve("fetchLibDir", "index.ts"),
      indexTpl,
      { routes },
      { formatters }
    );
  };

  return {
    async watchHandler(entries, event) {
      if (event) {
        // Incremental update
        if (event.kind === "update") {
          await generateRouteFiles(
            entries.filter(({ kind, route }) => {
              return kind === "api" && (
                route.fileFullpath === event.file ||
                route.referencedFiles?.includes(event.file)
              );
            })
          );
        }
      } else {
        // Initial generation
        await generateRouteFiles(entries);
      }

      // Always regenerate index to reflect current routes
      await generateIndexFile(entries);
    },
  };
};
```

