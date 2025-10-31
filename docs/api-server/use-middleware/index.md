---
title: API Server - use Middleware
description: API Server - use Middleware
---

Beyond the standard HTTP method handlers, you often need to run custom middleware —
code that executes before your main handler to perform tasks like authentication,
logging, or data transformation.

`KappaJS` provides the `use` function for this purpose,
which works similarly to Koa's standard middleware system but with additional capabilities.

The most basic use of `use` applies middleware to all HTTP methods on that endpoint:

```ts [api/example/index.ts]
export default defineRoute(({ GET, POST, use }) => [
  use(async (ctx, next) => {
    // This runs for both GET and POST requests
    console.log(`Request to ${ctx.path}`);
    return next();
  }),

  GET(async (ctx) => { /* ... */ }),
  POST(async (ctx) => { /* ... */ }),
]);
```

Middleware functions follow Koa's conventions.
They receive the context object and a `next` function, and they must call `next()`
to allow the request to proceed to subsequent middleware or the final handler.

If middleware doesn't call `next()`, the request stops there —
useful for cases where you want to reject a request early based on some condition.

### 🔄 Working with Middleware Chains

Understanding how middleware executes helps you structure your endpoints effectively.
Middleware runs in the order you define it in the array returned from your factory function.

Consider this example:

```ts [api/example/index.ts]
export default defineRoute(({ GET, POST, use }) => [
  use(async (ctx, next) => {
    console.log("First middleware");
    await next();
    console.log("First middleware after next");
  }),

  use(async (ctx, next) => {
    console.log("Second middleware");
    await next();
    console.log("Second middleware after next");
  }),

  POST(async (ctx) => {
    console.log("POST handler");
    ctx.body = { success: true };
  }),
]);
```

When a POST request arrives, you'll see this output:

```
First middleware
Second middleware
POST handler
Second middleware after next
First middleware after next
```

Middleware executes in order until reaching your method handler,
then unwinds back through the middleware in reverse order.

This "onion" model is a core Koa concept that `KappaJS` preserves.
It allows middleware to do work both before and after your handler runs —
useful for tasks like timing requests, catching errors, or modifying responses.

Global middleware from `core/api/use.ts` executes first,
followed by route-specific middleware defined with `use`, and finally your method handler.
([Details](/api-server/core-configuration))

This predictable order makes it easier to reason about what happens during a request.

