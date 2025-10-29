---
title: Writing Generators - Watch Handler
description: Writing Generators - Watch Handler
---

The watch handler is called whenever route files change.
It receives route entries and generates files accordingly:

```ts
async watchHandler(entries, event) {
  // entries: Array<RouteResolverEntry>
  // event: WatcherEvent | undefined

  for (const entry of entries) {
    if (entry.kind === "api") {
      // Process API routes
      const route = entry.route; // ApiRoute
    } else {
      // Process page routes
      const route = entry.route; // PageRoute
    }
  }
}
```

**On initial call** (when the dev server starts), `event` is `undefined`
and `entries` contains all routes.
This is when you should generate all files from scratch.

**On subsequent calls**, `event` contains information about what changed:

```ts
type WatcherEvent = {
  kind: "create" | "update" | "delete";
  file: string; // Absolute path to changed file
};
```

You can use this to perform incremental updates,
regenerating only affected files rather than everything.

