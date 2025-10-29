---
title: API Server - Type Safety - Payload / Response
description: API Server - Type Safety - Payload / Response
---

Beyond route parameters and context properties,
you can also type the request payload and response body for each HTTP method handler.

This ensures that your handlers receive the data they expect and return properly structured responses.

Method handlers (GET, POST, PUT, etc.) are generic functions that accept two optional type arguments.

The first types the payload — what comes in with the request.

The second types the response — what your handler should set as `ctx.body`.

```ts [api/example/index.ts]
import { defineRoute } from "@front/{api}/users";
import type { User } from "@front/types";

export default defineRoute(({ POST }) => [
  POST<
    { name: string; email: string; status?: string },
    User
  >(async (ctx) => {
    // ctx.payload is typed as { name: string; email: string; status?: string }
    const { name, email, status } = ctx.payload;

    const user = await createUser({ name, email, status });

    // ctx.body must be set to a User object
    // TypeScript will show an error if you try to use something else for ctx.body
    ctx.body = user;
  }),
]);
```

When you provide these types, TypeScript enforces them throughout your handler.
You get autocomplete on `ctx.payload` properties,
and TypeScript verifies that whatever you assign to `ctx.body` matches the response type.

Like parameter refinement, these types aren't just compile-time checks.
`AmperJS` validates the incoming payload against your specified type at runtime
and validates the outgoing response as well.
[Details](/validation/payload).

If validation fails, `AmperJS` handles the error appropriately without your handler code running.

