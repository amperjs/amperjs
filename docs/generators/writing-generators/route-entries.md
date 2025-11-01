---
title: Route Entry Structure
description: Understand RouteResolverEntry types including ApiRoute and PageRoute properties, PathToken structure, parameter metadata, and type information for generator development.
head:
  - - meta
    - name: keywords
      content: route entries, ApiRoute, PageRoute, PathToken, route parameters, type metadata, route structure, parameter schema
---

### RouteResolverEntry

All entries have this union type:

```ts
type RouteResolverEntry =
  | { kind: "api"; route: ApiRoute }
  | { kind: "page"; route: PageRoute };
```

Check the `kind` property to determine which type you're dealing with.

### Common Properties (RouteEntry)

Both `ApiRoute` and `PageRoute` extend `RouteEntry` with these properties:

**name** - Route identifier (e.g., "users/[id]")

**folder** - Either "api" or "pages", indicating which directory the route is in

**file** - Path to route file, relative to the folder

**fileFullpath** - Absolute path to the route file

**pathTokens** - Array of path segments with parameter information

**importName** - Generated identifier for importing this route

**importPath** - Path used in import statements

### PathToken Structure

Each token in the route path has this structure:

```ts
type PathToken = {
  orig: string;      // Original token text
  base: string;      // Base name without brackets
  path: string;      // Full path segment
  ext: string;       // File extension
  param?: {
    name: string;          // Parameter name
    const: string;         // Safe parameter name
    isRequired?: boolean;  // [id]
    isOptional?: boolean;  // [[id]]
    isRest?: boolean;      // [...path]
  };
};
```

Static segments have `param` as `undefined`.
Dynamic segments have `param` populated with metadata.

### ApiRoute Properties

API routes have additional properties for type information:

**params** - Route parameter metadata:
- `id` - Type identifier for params
- `schema` - Array of parameter tokens (subset of `PathToken` containing only dynamic segments)
- `resolvedType` - Flattened type information (if `resolveTypes: true`)

**numericParams** - Names of parameters refined as numbers

**optionalParams** - Whether route has any optional parameters

**methods** - HTTP methods this route handles (GET, POST, etc.)

**typeDeclarations** - Type definitions found in the route file

**payloadTypes** - Request body type information per method

**responseTypes** - Response type information per method

**referencedFiles** - Absolute paths to files this route imports from

### PageRoute Properties

Page routes have simpler parameter information:

**params** - Route parameter schema:
- `schema` - Array of parameter tokens (subset of `PathToken` containing only dynamic segments)


