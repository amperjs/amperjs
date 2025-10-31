---
title: Routing - Generated Content
description: Routing - Generated Content
---

When you create a new route file, `KappaJS` detects it and instantly generates appropriate boilerplate code.

This generation is context-aware — it produces different code depending on whether you're creating an API route or a client page,
and for pages, it adapts to your chosen frontend framework.

This automatic generation serves two purposes.

First, it saves you from the tedium of repeatedly typing the same structural code.

Second, and more importantly, it ensures that every route follows the correct patterns
and imports the right types from the beginning.

You get a working starting point that's already integrated with `KappaJS`'s type system.

## ⚙️ API Route Generation

When you create a file like `api/users/[id]/index.ts`, `KappaJS` generates this content:

```ts [api/users/[id]/index.ts][dark]
import { defineRoute } from "@front/{api}/users/[id]";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = "Automatically generated route: [ users/[id] ]"
  }),
]);
```

Let's break down what's happening here.

The import statement brings in a `defineRoute` helper function from a generated module.

Notice the import path: `@front/{api}/users/[id]`.

The `@front` part is your source folder (as configured in your TypeScript path mappings),
and the `{api}/users/[id]` part corresponds to the generated route's location.

This generated module includes TypeScript type information about your route's parameters.

In this case, it knows that this route has an `id` parameter,
and that information flows through to your handler's context object.

**Import Path Convention:**
- `@front/api/` → Your hand-written route files
- `@front/{api}/` → Auto-generated type definitions and utilities

The `defineRoute` function accepts a callback that receives HTTP method helpers.<br>
In this example, you see `GET`, but you also have access to `POST`, `PUT`, `DELETE`, `PATCH`, and other HTTP methods.

You can define handlers for multiple methods in the same route by adding more method calls to the array.

Each method handler receives a [Koa context](https://koajs.com/#context){target="_blank" rel="noopener"} object (`ctx`).

This object gives you access to the request (including headers, body, and parameters)
and the response (where you set status codes, headers, and body content).

The generated code sets `ctx.body` to a placeholder message,
which you replace with your actual business logic.

## 🎨 Client Page Generation

For client-side pages, the generated code adapts to your chosen framework.
If you create `pages/users/[id]/index.tsx` while using the SolidJS generator, `KappaJS` generates:

```ts [pages/users/[id]/index.tsx]
export default function Page() {
  return <div>Automatically generated Solid Page: [ users/[id] ]</div>;
}
```

This is a minimal functional component that you can immediately see in your browser
when you navigate to the corresponding URL.

The component is named `Page` by default but you can rename it to better reflect the component purpose.

Generated component returns JSX that renders a placeholder message indicating which route this is.

If you were using the React generator, the generated code would be nearly identical
but would follow React-specific patterns and conventions.

The generator understands your framework and produces appropriate code.

The generated scaffold gives you the component structure,
and you add your framework-specific logic for routing, data fetching, and rendering.

Because the route parameters are part of the URL structure that `KappaJS` manages,
your framework's router integration can access them naturally.

