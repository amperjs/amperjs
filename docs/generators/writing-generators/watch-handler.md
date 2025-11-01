---
title: Watch Handler Implementation
description: Implement watch handlers that process route changes with initial generation for all routes and incremental updates for create, update, and delete events.
head:
  - - meta
    - name: keywords
      content: watch handler, file watching, incremental updates, route entries, ApiRoute, PageRoute, file changes, event handling
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

