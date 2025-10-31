---
title: API Server - Type Safety - Params
description: API Server - Type Safety - Params
---

`KappaJS` generates TypeScript types for your route parameters based on your directory structure.

When you have a route like `users/[id]/index.ts`, `KappaJS` knows there's an `id` parameter.

However, by default, route parameters are typed as strings since that's what URLs contain.

Often you need more specific types. Maybe your user ID is actually a number,
or perhaps you have an action parameter that should be constrained to a specific set of valid values.

Refine your parameter types by passing a tuple to `defineRoute`'s first type argument.
The tuple positions correspond directly to the order of parameters in your route.

For a route at `users/[id]/index.ts` where the ID should be a number:

```ts [api/users/[id]/index.ts]
export default defineRoute<[number]>(({ GET }) => [
  GET(async (ctx) => {
    // ctx.typedParams.id is now typed as number
    const userId = ctx.typedParams.id;
  }),
]);
```

For a route with multiple parameters like `users/[id]/[action]/index.ts`:

```ts [api/users/[id]/[action]/index.ts]
type UserAction = "retrieve" | "update" | "delete";

export default defineRoute<[
  number,
  UserAction
]>(({ GET, POST }) => [
  GET(async (ctx) => {
    // ctx.typedParams.id is number
    // ctx.typedParams.action is "retrieve" | "update" | "delete"
    const { id, action } = ctx.typedParams;
  }),
]);
```

The position of the type argument corresponds to the position of the parameter in your route path.
The first type refines the first parameter, the second type refines the second parameter, and so on.

All positions are optional. But you can not skip positions.
If you need to refine second param, you'll have to also provide a type for first one.

### 🎯 Type Literal Requirement

The refinement tuple must be declared **inline as a type literal**.
While you can use type aliases for individual parameter types, you cannot reference a pre-defined tuple type.

**✅ This works:**
```ts [api/example/index.ts]
// Individual type aliases are fine
type UserID = number;
type UserAction = "retrieve" | "update" | "delete";

defineRoute<[
  UserID,
  UserAction,
]>(({ GET }) => [
  GET(async (ctx) => {
    // ctx.typedParams.id is number
    // ctx.typedParams.action is "retrieve" | "update" | "delete"
  }),
]);
```

**❌ This won't work:**
```ts [api/example/index.ts]
// Pre-defined tuple types are not supported
type Params = [number, UserAction];
defineRoute<Params>(/* ... */) // Error: type references won't work
```

**💡 Why this requirement?**
`KappaJS` needs to analyze the type structure at generation time to create corresponding validation schemas.
Type references don't preserve the necessary structural information for this analysis.

Think of it as providing the "blueprint" directly rather than a "reference to the blueprint"! 🏗️

### ✨ Beyond compile-time safety

These type refinements aren't just for TypeScript's benefit.
`KappaJS` also validates parameters at runtime according to your specifications!
[Details](/validation/params).

If a request comes in with an ID that can't be parsed as a number,
or an action that isn't one of your allowed values, `KappaJS` rejects the request before your handler runs.

This validation happens automatically — you don't need to write additional validation code!

