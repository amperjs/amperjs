---
title: Validation - TRefine for Advanced Refinement
description: Validation - TRefine for Advanced Refinement
---

Often you need more sophisticated validation than just presence of a string or a number.

Perhaps your user ID should not only be a number but also fall within a specific range.
Or perhaps it should be an integer rather than allowing decimal values.

`KappaJS` provides the `TRefine` type for expressing these additional constraints.
It is a global-defined type so you can use it without import.

The `TRefine` type accepts two arguments.

🔹The first is the primitive type you're refining (like `number` or `string`).

🔹The second is an object containing JSON Schema refinement specifications.

These specifications define additional constraints beyond the basic type.

Suppose your user IDs are integers that must be greater than or equal to 1000 and less than or equal to 1,000,000.
You express this with `TRefine`:


```ts
TRefine<number, { minimum: 1000, maximum: 1_000_000 }>
```

The `minimum` and `maximum` properties come from JSON Schema's numeric validation vocabulary.
They're part of the [JSON Schema Validation specification](https://json-schema.org/draft/2020-12/json-schema-validation.html){target="_blank" rel="noopener"},
which defines a comprehensive set of keywords for validating different data types.

You can explore the full range of available refinements in the JSON Schema documentation,
including properties for strings (like `minLength`, `maxLength`, `pattern`),
arrays (like `minItems`, `maxItems`, `uniqueItems`),
and objects (like `required`, `additionalProperties`).

Now consider a subtle issue with the validation we just defined.<br>
While we've constrained the ID to a numeric range, we haven't enforced that it must be an integer.

A request to `/api/users/1000.5` would pass validation even though it's almost certainly not a valid user ID.

Most databases would reject such a value if the ID column is defined as an integer type,
potentially causing an error deeper in your application.

JSON Schema provides a way to constrain numbers to be multiples of a specific value
through the `multipleOf` property. When you specify `multipleOf: 1`,
you're saying the number must be evenly divisible by one —
which is exactly how you express that a number should be an integer:

```ts
TRefine<number, { minimum: 1000, maximum: 1_000_000, multipleOf: 1 }>
```

This pattern of using `TRefine` to add JSON Schema constraints directly in your TypeScript types
is powerful because it keeps all your validation logic in one place — your type definitions.

You're not maintaining separate validation schemas that could drift out of sync with your types.
The type is the schema, and the schema is the type.

The `TRefine` type is globally available throughout your `KappaJS` project,
so you don't need to import it. This makes it convenient to use wherever you need refined types.

