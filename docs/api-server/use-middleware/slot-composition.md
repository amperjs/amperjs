---
title: API Server - use Middleware - Slot Composition
description: API Server - use Middleware - Slot Composition
---

`AmperJS`'s slot system gives you fine-grained control over middleware composition and override behavior.

Using slot composition, you can precisely control which middleware runs and when, including selective overrides.

This becomes important when working with global middleware that applies to all routes
but needs customization for specific endpoints.

`AmperJS` applies certain middleware globally through a core configuration file located at `core/api/use.ts`.

This file defines middleware that runs for every API endpoint by default.
However, individual routes can override this default behavior using slots.

A slot is essentially a named position in the middleware chain.
When you assign a slot name to middleware, any subsequent middleware
with the same slot name replaces the earlier one.

This replacement mechanism gives you fine-grained control over which middleware runs where.

Let's look at a concrete example from `AmperJS`'s core configuration:

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

This configuration establishes two pieces of default behavior.
First, it sets up JSON body parsing for POST, PUT, and PATCH requests using the `bodyparser` slot.

Second, it defines how `ctx.payload` gets populated using the `payload` slot.

Now suppose you have an endpoint that needs to accept form data instead of JSON.
You can override the bodyparser middleware by using the same slot name:

```ts [api/example/index.ts]
import bodyparser from "@amperjs/api/bodyparser";
import { defineRoute } from "@front/{api}/upload";

export default defineRoute(({ POST, use }) => [
  use(bodyparser.form(), {
    slot: "bodyparser",
    on: ["POST"],
  }),

  POST(async (ctx) => {
    // ctx.request.body now contains parsed form data
  }),
]);
```

By using `slot: "bodyparser"`, this route-specific middleware replaces
the default JSON bodyparser for this endpoint only.

Other endpoints continue using JSON parsing
because their middleware chain still includes the default from `core/api/use.ts`.

**Important:** When you override middleware using a slot,
you must explicitly specify which methods it should run on with the `on` option.
The `on` configuration doesn't inherit from the middleware you're replacing.

If you omit the `on` option, your slotted middleware will run for all HTTP methods,
which might not be what you want and could cause errors for methods that don't expect that processing.

Similarly, you could override how `ctx.payload` is constructed for a specific endpoint:

```ts [api/example/index.ts]
export default defineRoute(({ GET, POST, use }) => [
  use(async (ctx, next) => {
    // Custom payload construction logic
    ctx.payload = await parseCustomFormat(ctx);
    return next();
  }, { slot: "payload" }),

  GET(async (ctx) => { /* ... */ }),
  POST(async (ctx) => { /* ... */ }),
]);
```

The slot system gives you a powerful way to establish sensible defaults
while maintaining the flexibility to customize behavior where needed.

It's particularly useful in larger applications
where you want consistent behavior across most endpoints but need exceptions for specific cases.

### 🔗 Combining Body Parsers with Custom Logic

While `AmperJS` provides convenient body parsers for JSON and form data
through the `@amperjs/api/bodyparser` module, you're not limited to these.
The slot system for the bodyparser middleware means you can plug in any Koa-compatible body parsing middleware.

If you need to parse XML, multipart form data with file uploads, or any other format,
you can use existing Koa middleware packages.
Just use the `bodyparser` slot when registering them
to ensure they replace the default JSON parser for that specific route:

```ts [api/example/index.ts]
import { defineRoute } from "@front/{api}/upload";
import multer from "@koa/multer";

const upload = multer({ dest: "uploads/" });

export default defineRoute(({ POST, use }) => [
  use(upload.single("file"), {
    slot: "bodyparser",
    on: ["POST"],
  }),

  POST(async (ctx) => {
    // ctx.file contains the uploaded file information
    // Process the upload
  }),
]);
```

This flexibility means `AmperJS` doesn't box you into specific formats or parsers.
Use what makes sense for your application, and `AmperJS`'s structure accommodates it.

