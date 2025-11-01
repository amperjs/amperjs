---
title: Incremental Updates
description: Optimize generator performance with incremental updates that regenerate only affected routes when files change using referencedFiles dependency tracking.
head:
  - - meta
    - name: keywords
      content: incremental generation, performance optimization, file dependencies, referencedFiles, change detection, selective regeneration
---

For better performance, implement incremental updates
by checking the `event` parameter:

```ts
async watchHandler(entries, event) {
  if (event) {
    // File changed - regenerate only affected routes
    if (event.kind === "update" || event.kind === "create") {
      const affected = entries.filter(({ kind, route }) => {
        if (kind !== "api") return false;

        // Route's own file changed
        if (route.fileFullpath === event.file) return true;

        // A file this route imports changed
        if (route.referencedFiles?.includes(event.file)) return true;

        return false;
      });

      await generateFiles(affected);
    }

    if (event.kind === "delete") {
      // Clean up generated files for deleted route
      await cleanupFiles(event.file);
    }
  } else {
    // Initial call - generate everything
    await generateFiles(entries);
  }
}
```

The `referencedFiles` array helps you track dependencies.
When a type definition file changes, all routes that import from it
should be regenerated.

