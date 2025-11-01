---
title: Alias Plugin
description: AliasPlugin automatically resolves TypeScript path mappings from tsconfig.json to filesystem locations, enabling imports like @front/{api} and @front/{fetch} to work correctly.
head:
  - - meta
    - name: keywords
      content: alias plugin, path mappings, tsconfig paths, typescript aliases, vite aliases, import resolution, virtual paths
---

### 🔀 The AliasPlugin

The AliasPlugin handles the complexity of resolving TypeScript path mappings
to actual filesystem locations.

You typically don't configure this plugin directly —
it reads your `tsconfig.json` automatically and sets up Vite aliases to match.

```ts
aliasPlugin(import.meta.dirname)
```

The plugin receives your project root directory
and performs these operations:

It reads the `paths` configuration from `tsconfig.json`.
It analyzes the filesystem to understand what files exist
in both source directories and the `lib` directory.
It translates TypeScript path patterns (like `@front/*`)
into Vite alias configurations that point to the correct directories.

This translation is what allows imports like `@front/{api}/users/[id]`
to resolve correctly during development and build,
even though these paths don't exist in a traditional sense—
they're virtual paths that map to actual files based on your project structure.

The AliasPlugin updates dynamically as you add or remove source folders,
ensuring that new path mappings in `tsconfig.json` are immediately available in Vite.

