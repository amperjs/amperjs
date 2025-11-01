---
title: Getting Started with Fetch Client
description: Import and use KappaJS generated fetch clients with full TypeScript typing. Access routes directly or through a centralized map with automatic parameter and payload validation.
head:
  - - meta
    - name: keywords
      content: fetch client, typed fetch, api client, http methods, route parameters, payload typing, response types, typescript api client
---

You can import fetch clients in two ways, depending on whether you want to access a specific route's client
or work with all your routes through a centralized map.

For direct access to a specific route's client, import from the route's generated fetch file.
The import path follows the pattern of your source folder,
followed by `{api}`, then the route path, and finally `/fetch`:

```ts [pages/example/index.tsx]
import useFetch from "@front/{api}/users/[id]/fetch";

// Use the client directly
const response = await useFetch.GET([123]);
```

For access to all routes through a centralized map, import from your source folder's fetch index:

```ts [pages/example/index.tsx]
import fetchMap from "@front/{fetch}";

// Access a specific route through the map
const useFetch = fetchMap["users/[id]"];
const response = await useFetch.GET([123]);
```

The fetch index exports a default object that maps route paths to their corresponding clients.
This approach is useful when you want to dynamically select clients based on route names,
or when you prefer to work with a single import that gives you access to your entire API surface.

### 🚀 Using the Fetch Client Methods

The fetch client exports methods for each HTTP verb your API route handles.

If your route defines GET, POST, and PUT handlers, the client exports GET, POST, and PUT functions.

These functions accept parameters and payloads according to the types you specified in your route definition.

The method signature adapts to your route's requirements. If your route has parameters,
the first argument is an array of parameter values in the order they appear in the route path.

If your route's handler defines a payload type, the second argument accepts payload data.

Both arguments are typed according to your API definition, so TypeScript guides you toward correct usage.

Consider an API route with a typed parameter and payload:

```ts [api/users/[id]/index.ts]
// API route definition
import { defineRoute } from "@front/{api}/users/[id]";

export default defineRoute<[number]>(({ GET }) => [
  GET<
    { name?: string },
    { id: number; name: string; email: string }
  >(async (ctx) => {
    // Handler implementation
  }),
]);
```

The generated fetch client for this route expects a number parameter and optional payload:

```ts [pages/example/index.tsx]
import useFetch from "@front/{api}/users/[id]/fetch";

// Call with just parameters
const response = await useFetch.GET([123]);

// Call with parameters and payload
const response = await useFetch.GET([123], { name: "John" });
```

The `response` variable is typed as `{ id: number; name: string; email: string }`
because that's what your API route declared as its response type.

TypeScript ensures you handle the response correctly, and when validation is enabled,
runtime checks ensure the response actually matches this structure.

### 📭 Routes Without Parameters or Payloads

Not all routes need parameters or payloads. A route at `api/users/index.ts`
with no parameters and no payload or response types can be called without arguments:

```ts
import useFetch from "@front/{api}/users/fetch";

const response = await useFetch.GET();
```

If the route defines a payload type but you're using a method like GET that typically doesn't send a body,
you still provide the payload argument. The generated client handles translating this into query parameters:

```ts
// GET with query parameters
const response = await useFetch.GET([], { filter: "active", page: 1 });
```

If a route defines no payload type or explicitly uses `never` as the payload type,
the fetch method doesn't require the second argument.

The generated client adapts to exactly what your API expects,
making it impossible to call endpoints incorrectly.
