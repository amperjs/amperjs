---
title: API Server - use Middleware - Method-Specific Middleware
description: API Server - use Middleware - Method-Specific Middleware
---

Often you want middleware to run only for specific HTTP methods.

For example, authentication might be required for POST, PUT, and DELETE requests
but not for GET requests.

`AmperJS` supports this through the `on` option:

```ts [api/example/index.ts]
export default defineRoute(({ GET, POST, PUT, DELETE, use }) => [
  use(async (ctx, next) => {
    // ...
    ctx.state.user = await verifyToken(token);
    return next();
  }, {
    on: ["POST", "PUT", "DELETE"], // run only on these methods
  }),

  GET(async (ctx) => {
    // Public access - no authentication required
  }),

  POST(async (ctx) => {
    // ctx.state.user is available here
  }),

  PUT(async (ctx) => {
    // ctx.state.user is available here
  }),

  DELETE(async (ctx) => {
    // ctx.state.user is available here
  }),
]);
```

The `on` option accepts an array of HTTP method names.
The middleware only executes when the incoming request matches one of those methods.

This targeted approach keeps your middleware efficient and your intentions clear.

