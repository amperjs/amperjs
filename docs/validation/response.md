---
title: Response Validation
description: Validate API responses before sending to clients. Catch bugs where handlers return incomplete objects, wrong types, or unexpected structures with automatic runtime checking.
head:
  - - meta
    - name: keywords
      content: response validation, output validation, api contract, response typing, data integrity, runtime response check, ValidationError
---

Just as you validate incoming request data, you can validate outgoing response data.

Response validation ensures that your API contract is honored —
that you actually return the data structure your types promise.

This catches bugs where handlers might return incomplete objects, wrong types, or unexpected structures.

Response validation works similarly to payload validation,
using the second type argument to your method handler:

```ts [api/users/index.ts]
import { defineRoute } from "@front/{api}/users";
import type { User } from "@front/types/api-payload";

export default defineRoute(({ GET }) => [
  GET<
    never, // or add a type to validate payload
    User
  >(async (ctx) => {
    const user = await fetchUserFromDatabase(ctx.params.id);

    // ctx.body must be a valid User
    // If it doesn't match the User type, KappaJS throws a ValidationError
    ctx.body = user;
  }),
]);
```

In this example, we use `never` as the payload type because request not supposed to have any payload.
The second type argument specifies that the response should match the `User` type.

Also `TRefine` can be used for fine-grained validation. ([Details](/validation/refine))

Before sending the response to the client,
`KappaJS` validates that `ctx.body` actually contains a properly structured User object
with all required fields matching their expected types.

If validation fails — perhaps because the database returned a user object that's missing the `preferences` field,
or because the `profile.email` doesn't match email format constraints — `KappaJS` throws a ValidationError
instead of sending invalid data to the client.

This protects your API consumers from receiving malformed data and helps you catch bugs in your handler logic.

For routes that both receive and return validated data:

```ts [api/example/index.ts]
export default defineRoute(({ POST }) => [
  POST<
    CreateUserPayload,
    User
  >(async (ctx) => {
    // ctx.payload is validated as CreateUserPayload
    const newUser = await createUser(ctx.payload);

    // ctx.body must be a valid User
    ctx.body = newUser;
  }),
]);
```

Both the incoming request payload and the outgoing response body are validated automatically.

This end-to-end validation gives you confidence that data flows through your API correctly.

