---
title: Skip Runtime Validation
description: Use @skip-validation JSDoc comment to keep TypeScript type checking without runtime validation for gradual adoption, performance optimization, or trusted internal endpoints.
head:
  - - meta
    - name: keywords
      content: skip validation, opt-out validation, jsdoc comments, gradual adoption, performance optimization, type checking only
---

Sometimes you might want TypeScript type checking without runtime validation.

Perhaps you're gradually adding validation to an existing API,
or perhaps a specific endpoint has unusual performance requirements
that make validation overhead unacceptable.

`KappaJS` provides an escape hatch through the `@skip-validation` JSDoc comment.

When you add this comment to a type parameter,
`KappaJS` generates TypeScript types for compile-time checking but skips runtime validation:

```ts [api/example/index.ts]
export default defineRoute(({ POST }) => [
  POST<
    /** @skip-validation */
    Payload<User>,
    User
  >(async (ctx) => {
    // ctx.payload has the Payload<User> type for TypeScript
    // but no runtime validation occurs on the incoming payload
    // ctx.body is still validated as User at runtime
  }),
]);
```

In this example, the payload is typed but not validated, while the response is both typed and validated.
You might use this pattern during development when you're iterating quickly on payload structures
and don't want validation failures interrupting your flow.

Or you might use it for trusted internal endpoints where you control both client
and server and have high confidence in data correctness.

The skip comment works for both payload and response type arguments.
However, you cannot skip parameter validation.
Route parameters are always validated because they're part of your URL structure and affect routing behavior.
Skipping their validation would create ambiguity about which routes should handle which requests.

Use the skip comment judiciously. Runtime validation is a powerful tool
for ensuring data correctness and catching bugs early.
Skipping validation means giving up these benefits, so you should have a clear reason for doing so.

