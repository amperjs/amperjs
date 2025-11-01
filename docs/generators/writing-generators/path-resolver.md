---
title: Path Resolver Utility
description: Use pathResolver for consistent path construction across KappaJS directory structure including source folders, lib directories, and root locations with type-safe directory names.
head:
  - - meta
    - name: keywords
      content: path resolver, directory structure, apiLibDir, pagesLibDir, fetchLibDir, path construction, file paths, typescript paths
---

The `pathResolver` utility provides consistent path construction
across `KappaJS`'s directory structure.

It handles the complexity of different directory types —
some relative to the project root, some to the source folder,
and some nested within the `lib` directory.

## Basic Usage

```ts [factory.ts]
import { pathResolver } from "@kappajs/devlib";

export const factory: GeneratorFactory = async ({
  appRoot,
  sourceFolder,
  formatters,
}) => {
  const { resolve } = pathResolver({ appRoot, sourceFolder });

  // Resolve paths to various locations
  const apiPath = resolve("apiDir", "users/[id]/index.ts");
  const libPath = resolve("apiLibDir", "users/[id]/types.ts");
  const corePath = resolve("coreDir", "middleware.ts");

  return { watchHandler };
};
```

## Directory Types

The resolver understands different directory categories
and constructs paths accordingly:

### Source Folder Shortcut

**`@`** - Resolves directly to the source folder root

```ts
resolve("@", "config/index.ts")
// → @front/config/index.ts
```

### Root-Level Directories

**`coreDir`** and **`libDir`** - Resolve to project root locations

```ts
resolve("coreDir", "api/middleware.ts")
// → core/api/middleware.ts

resolve("libDir", "types.ts")
// → lib/types.ts
```

These directories exist at the project root, not within source folders.

### Source-Relative Directories

Directories like **`apiDir`**, **`pagesDir`**, **`configDir`**
resolve relative to the current source folder:

```ts
resolve("apiDir", "users/index.ts")
// → @front/api/users/index.ts

resolve("pagesDir", "dashboard/index.tsx")
// → @front/pages/dashboard/index.tsx

resolve("configDir", "index.ts")
// → @front/config/index.ts
```

### Lib Directories

Directories ending in **`LibDir`** (like `apiLibDir`, `pagesLibDir`, `fetchLibDir`)
combine the global `lib` directory with the source folder and the specific lib subdirectory:

```ts
resolve("apiLibDir", "users/[id]/types.ts")
// → lib/@front/{api}/users/[id]/types.ts

resolve("fetchLibDir", "index.ts")
// → lib/@front/{fetch}/index.ts

resolve("pagesLibDir", "dashboard/route.ts")
// → lib/@front/{pages}/dashboard/route.ts
```

This structure keeps generated files organized by source folder
while maintaining a global `lib` directory for all generated code.

## Implementation Details

The resolver applies these rules:

1. **`@` shortcut** → Source folder directly
2. **`coreDir` or `libDir`** → Project root location
3. **Directories ending in `LibDir`** → `lib/{sourceFolder}/{specificLibDir}`
4. **All other directories** → `{sourceFolder}/{specificDir}`

The `appRoot` parameter, when provided, prefixes all resolved paths
to create absolute file paths suitable for file system operations.

## Available Directories

The resolver works with all directory constants from `KappaJS`'s defaults.
Common directories include:

**Source directories:**
- `apiDir` - API routes directory
- `pagesDir` - Page components directory
- `configDir` - Configuration directory

**Lib directories:**
- `apiLibDir` - Generated API helpers
- `pagesLibDir` - Generated page helpers
- `fetchLibDir` - Generated fetch clients

**Root directories:**
- `coreDir` - Core application code
- `libDir` - Generated code root

## Type Safety

The `Dir` type ensures you only reference valid directory names:

```ts
type Dir =
  | keyof {
      [K in keyof typeof defaults as K extends `${string}Dir`
        ? K
        : never]: unknown;
    }
  | "@";
```

This extracts all keys from defaults that end with `"Dir"`,
plus the `"@"` shortcut, providing autocomplete and compile-time validation.

If you attempt to use an invalid directory name,
TypeScript will catch it during development.

## Practical Examples

### Generating API Files

```ts
const { resolve } = pathResolver({ appRoot, sourceFolder });

// Generate route helper
await renderToFile(
  resolve("apiLibDir", route.importPath, "helpers.ts"),
  helperTemplate,
  { route },
  { formatters }
);

// Generate route types
await renderToFile(
  resolve("apiLibDir", route.importPath, "types.ts"),
  typesTemplate,
  { route },
  { formatters }
);
```

### Generating Framework Files

```ts
const { resolve } = pathResolver({ appRoot, sourceFolder });

// Generate router configuration
await renderToFile(
  resolve("pagesLibDir", "router.ts"),
  routerTemplate,
  { routes },
  { formatters }
);

// Write to source folder directly
await renderToFile(
  resolve("@", "App.tsx"),
  appTemplate,
  {},
  { formatters }
);
```

### Reading Core Files

```ts
const { resolve } = pathResolver({ appRoot, sourceFolder });

// Read core middleware
const middlewarePath = resolve("coreDir", "api/middleware.ts");
const middlewareContent = await fs.readFile(middlewarePath, "utf8");
```

## Best Practices

**Always use the resolver** rather than manually constructing paths.
The resolver ensures consistency and handles the complexity
of different directory nesting patterns.

**Import from `@kappajs/devlib`** to access the resolver and other utilities
rather than implementing your own path logic.

**Leverage type safety** by letting TypeScript guide you
to valid directory names through autocomplete.

**Use the `@` shortcut** when you need to write directly to the source folder,
such as for framework setup files that users might customize.

**Prefer lib directories** for generated code that users shouldn't edit manually.
This keeps the source folder clean and makes it clear
what's user code versus generated artifacts.

