---
title: API Server - Core Configuration Files
description: API Server - Core Configuration Files
---

`AmperJS` uses several core configuration files that affect all API endpoints.
Understanding these files helps you customize the behavior of your entire API surface.

## ⚙️ Global Middleware

The first file, `core/api/use.ts`, defines global middleware that applies to every API endpoint.
We've already seen how it sets up body parsing and payload construction.

You can add your own global middleware here — things like request logging,
CORS headers, error handling, or any other cross-cutting concern that should apply universally.

Just remember that anything you add here runs for every request, so keep it efficient.

Default configuration file created during project initialization:

```ts [core/api/use.ts]
import { use } from "@amperjs/api";
import bodyparser from "@amperjs/api/bodyparser";

export default [
  use(bodyparser.json(), {
    on: ["POST", "PUT", "PATCH"],
    slot: "bodyparser",
  }),

  use(
    (ctx, next) => {
      ctx.payload = ["POST", "PUT", "PATCH"].includes(ctx.method)
        ? ctx.request.body
        : ctx.query;
      return next();
    },
    { slot: "payload" },
  ),
];
```

## 🔧 Default Context/State

The second file, `core/api/env.d.ts`, provides TypeScript type definitions
that extend Koa's context and state objects. By default, it looks like this:

```ts [core/api/env.d.ts]
export declare module "@amperjs/api" {
  interface DefaultState {}
  interface DefaultContext {}
}
```

These empty interfaces are your extension points.
When middleware adds properties to the context or state objects,
you declare those properties here to get proper type checking throughout your application.

Suppose you have authentication middleware that attaches a user object to the context.
You'd declare this in `env.d.ts`:

```ts [core/api/env.d.ts]
export declare module "@amperjs/api" {
  interface DefaultState {}
  interface DefaultContext {
    authorizedUser: User;
  }
}
```

Now every route handler knows about `ctx.authorizedUser`
and TypeScript will properly type-check your usage of it.

This is much more maintainable than redeclaring these types in every route file.

Similarly, if you store data in `ctx.state`, declare it through `DefaultState`:

```ts [core/api/env.d.ts]
export declare module "@amperjs/api" {
  interface DefaultState {
    permissions: Array<"read" | "write" | "admin">;
  }
  interface DefaultContext {
    authorizedUser: User;
  }
}
```

Now every route handler knows about `ctx.state.permissions`
and TypeScript will properly type-check your usage of it.

This approach — declaring types once in a central location —
keeps your codebase DRY and ensures consistency across all your endpoints.

