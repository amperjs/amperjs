---
title: Payload Validation
description: Validate request payloads with inline TypeScript types or imported type definitions. Support for nested structures, conditional validation, generics, and complex domain models with TRefine constraints.
head:
  - - meta
    - name: keywords
      content: payload validation, request validation, nested types, conditional validation, union types, generic types, json validation, form validation, TRefine
---

Request payloads are the data your API receives from clients —
including query parameters in GET requests and JSON or form bodies in POST/PUT/PATCH requests.

These payloads often have complex nested structures with multiple fields,
each requiring specific validation rules to ensure data integrity.

`KappaJS` makes payload validation straightforward by letting you express validation rules
directly through TypeScript types.

You write the type once, and it serves both as compile-time documentation
and runtime validation enforcement.

## 📦 Validating Request Payloads

`KappaJS` makes payload validation as simple as providing a type to your method handler.

You can use literal type definitions written inline, or you can reference types defined elsewhere and imported.

The simplest approach is to define the payload type inline as the first type argument to your method handler:

```ts [api/posts/index.ts]
import { defineRoute } from "@front/{api}/posts";

export default defineRoute(({ POST }) => [
  POST<{
    title: TRefine<string, { minLength: 1, maxLength: 255 }>;
    content: string;
    tags: string[];
    isPublished: boolean;
    scheduledPublishAt?: TRefine<string, { format: "date-time" }>;
  }>(async (ctx) => {
    // ctx.payload is fully validated and typed
    const { title, content, tags, isPublished, scheduledPublishAt } = ctx.payload;
  }),
]);
```

In this example, we're creating a blog post endpoint.

🔹The title must be a non-empty string no longer than 255 characters.

🔹The content is required but has no length constraints.

🔹Tags must be an array of strings.

🔹The published status is a required boolean.

🔹The scheduled publish time is optional, but when provided, it must be a valid ISO 8601 date-time string.

Notice how we use `TRefine` to add validation constraints to specific fields.

The `minLength` and `maxLength` constraints ensure titles aren't empty or excessively long.

The `format: "date-time"` constraint leverages JSON Schema's format validation
to ensure dates are properly formatted.

Without `TRefine`, fields are validated only for their basic type — a string must be a string,
an array must be an array, but no additional constraints apply.

The question mark after `scheduledPublishAt` makes it optional.
Optional fields can be omitted from the payload entirely.
If they are present, they must match their specified type and pass any refinement constraints.

## 🏗️ Complex Nested Structures

Real-world payloads often have deeply nested structures with conditional fields and references to other types.
`KappaJS` handles this complexity naturally because you're just writing TypeScript types.

You can nest objects, use union types for conditional fields, reference other types,
and generally express any structure that TypeScript can represent.

Here's a more complex example for a payment processing endpoint:

```ts [api/example/index.ts]
export default defineRoute(({ POST }) => [
  POST<{
    orderId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
    amount: TRefine<number, { minimum: 0.01, maximum: 1000000 }>;
    currency: TRefine<string, { pattern: "^[A-Z]{3}$" }>;
    paymentMethod: {
      type: "card" | "wallet";
      card?: {
        number: TRefine<string, { pattern: "^[0-9]{13,19}$" }>;
        expMonth: TRefine<number, { minimum: 1, maximum: 12 }>;
        expYear: number;
        cvc: TRefine<string, { pattern: "^[0-9]{3,4}$" }>;
        holderName: string;
      };
      wallet?: {
        walletId: string;
        token: TRefine<string, { minLength: 1, maxLength: 500 }>;
      };
    };
    billingAddress: {
      line1: TRefine<string, { minLength: 1, maxLength: 100 }>;
      line2?: string;
      city: string;
      state: TRefine<string, { minLength: 2, maxLength: 2 }>;
      postalCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
      country: string;
    };
  }>(async (ctx) => {
    // Every field is validated according to its constraints
    const payment = ctx.payload;
  }),
]);
```

This payload type demonstrates several advanced patterns.

The `orderId` uses a regex pattern to ensure it contains only alphanumeric characters, underscores, and hyphens.

The `amount` must be a positive number (at least one cent) capped at a reasonable maximum.

The `currency` must be a three-letter uppercase code.

The `paymentMethod` field shows conditional validation.
It has a discriminator field called `type` that determines which additional fields should be present.
When the type is "card", the `card` object should be provided with card details.
When the type is "wallet", the `wallet` object should be provided instead.

Both the card number and CVC use regex patterns to validate their format.
The expiration month is constrained to the valid range of 1 through 12.

The billing address demonstrates nested required and optional fields
with various string length and format constraints.

The state uses length constraints to enforce two-character state codes,
while the postal code uses a regex pattern to match US zip code formats
(five digits, optionally followed by a hyphen and four more digits).

All of these constraints are checked at runtime before your handler executes.
If any field fails validation—wrong type, out of range, doesn't match pattern,
missing required field, includes unexpected field — `KappaJS` rejects the request
with a detailed validation error that tells the client exactly what went wrong.

## 🔗 Working with Referenced Types

As your application grows, defining complex types inline becomes unwieldy.
You'll want to define types once and reuse them across multiple routes.

`KappaJS` fully supports this pattern—you can define types in separate files,
import them where needed, and use them for validation just like inline types.

Suppose you have a file defining user-related types:

```ts [types/user.ts]
export type UserProfile = {
  name: TRefine<string, { minLength: 1, maxLength: 255 }>;
  email: TRefine<string, { format: "email" }>;
};

export type UserPreferences = {
  theme: "light" | "dark";
  notifications: NotificationPreferences;
};

type NotificationPreferences = {
  enabled: boolean;
};
```

And another file defining API payload wrappers:

```ts [types/api-payload.ts]
import type { UserProfile, UserPreferences } from "./user";

export type Payload<T> = {
  data: T;
  meta: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    cache: {
      ttl: number;
      revalidate: boolean;
    };
  };
};

export type User = {
  id: number;
  profile: UserProfile;
  preferences: UserPreferences;
  posts: Post[];
};

export type Post = {
  id: TRefine<number, { minimum: 1, multipleOf: 1 }>;
  title: string;
  tags: { id: string; name: string }[];
  stats?: { views: number; likes: number };
};
```

Now you can use these types in any route by importing them:

```ts [api/users/index.ts]
import { defineRoute } from "@front/{api}/users";
import type { User, Payload } from "@front/types/api-payload";

export default defineRoute(({ POST }) => [
  POST<
    Payload<User>
  >(async (ctx) => {
    // ctx.payload is fully validated as Payload<User>
    // This includes the generic type parameter resolution
    const user = ctx.payload.data;
  }),
]);
```

`KappaJS`'s type-to-schema conversion handles complex type constructs including generics,
unions, intersections, and deeply nested structures.

When you use `Payload<User>`, the generator resolves the generic type parameter,
traces through all the referenced types (including `UserProfile` and `UserPreferences`),
and generates a complete validation schema that validates the entire structure.

This means you can build a library of reusable types that encode your domain model and validation rules once,
then reference them throughout your API.

Changes to these type definitions automatically update the validation behavior everywhere they're used.

Different routes can use the same generic type with different parameters:

```ts [api/posts/index.ts]
import { defineRoute } from "@front/{api}/posts";
import type { Post, Payload } from "@front/types/api-payload";

export default defineRoute(({ POST }) => [
  POST<
    Payload<Post>
  >(async (ctx) => {
    // ctx.payload is fully validated as Payload<Post>
    const post = ctx.payload.data;
  }),
]);
```

Both routes benefit from the same payload wrapper structure with its metadata and pagination fields,
but validate different data types within that structure.

This composability makes your validation logic both DRY and maintainable.

