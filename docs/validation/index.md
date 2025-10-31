---
title: Validation - Rationale
description: Validation - Rationale
---

One of `KappaJS`'s most compelling features is its approach to validation.

It's called "runtype" validation —
your TypeScript types are automatically converted into JSON Schema and validated at runtime.

Rather than forcing you to learn and maintain separate schema definition languages,<br>
`KappaJS` lets you express validation rules directly in TypeScript.

You write standard TypeScript types with optional refinements,
and `KappaJS` automatically generates high-performance runtime validators from those types.

This creates a seamless development experience where your type definitions
serve as both compile-time type checking and runtime validation,
all without duplicating your specifications.

## 🛡️ Understanding Runtype Validation

By default, when you provide type annotations to your route parameters, payloads, and responses,
those annotations provide compile-time type checking through TypeScript.

Your editor gives you autocomplete, catches type errors before you run your code, and helps you refactor safely.

However, these compile-time checks don't protect you at runtime.
When actual HTTP requests arrive with unpredictable data from the outside world,
TypeScript can't help you — it only exists during development and compilation.

This is where `KappaJS`'s runtype validation comes in.
By installing a validation generator, you enable runtime validation that mirrors your TypeScript types exactly.

The same type definitions that give you compile-time safety
also generate validation logic that runs when requests arrive,
ensuring that the data actually matches what your types promise.

`KappaJS` provides a TypeBox-based validator that generates highly optimized validation code.
TypeBox compiles your types into JSON Schema internally,
which is the widely-recognized standard for data validation across programming languages and platforms.

You don't need to learn JSON Schema directly — `KappaJS` handles the conversion transparently.
But knowing that JSON Schema powers the validation under the hood helps you understand
what's possible and how to refine your types for specific validation needs.

## ⚙️ Setting Up Validation

To enable runtype validation, you need to install and configure the validation generator.
Start by adding the TypeBox generator package to your project, then register it in your Vite configuration.

::: code-group

```sh [npm]
npm install -D @kappajs/typebox-generator
```

```sh [pnpm]
pnpm install -D @kappajs/typebox-generator
```

```sh [yarn]
yarn add -D @kappajs/typebox-generator
```
:::

Then in your source folder's `vite.config.ts`, import the generator and add it to the generators array:

```ts [vite.config.ts]
import devPlugin from "@kappajs/dev";
import typeboxGenerator from "@kappajs/typebox-generator";

export default {
  plugins: [
    devPlugin(apiurl, {
      generators: [
        typeboxGenerator(),
        // other generators you're using
      ],
    }),
  ],
}
```

Once configured, the generator watches your API route definitions
and automatically generates validation code whenever you save changes.

This validation code lives in the `lib` directory alongside other generated artifacts,
keeping your source directories clean.

With the generator in place, every type annotation you provide for route parameters,
request payloads, and responses becomes a runtime validation check.
You don't need to write additional validation code or call validation functions explicitly.

`KappaJS` integrates validation directly into the request processing pipeline,
checking data before it reaches your handlers and after your handlers produce responses.

## 🔄 The Power of End-to-End Validation

`KappaJS`'s validation is end-to-end, which means it spans from the client making requests
all the way through to the server processing them.
This architecture provides benefits beyond simple data validation.

When you enable validation with the TypeBox generator,
`KappaJS` also generates a fully-typed fetch client for every API route.

This generated client isn't just typed — it actively validates request data on the client side
before sending anything to the server.
If validation fails, the client throws an error immediately without making a network request.

This client-side validation uses exactly the same schemas that validate on the server,
ensuring perfect consistency between what the client considers valid and what the server accepts.

This approach has significant performance implications.
Invalid requests never reach your server, reducing unnecessary network traffic and server load.

For high-traffic APIs, this client-side validation can dramatically reduce the number of requests
your servers need to process. Users also get faster feedback when they make mistakes,
since validation errors appear instantly without waiting for a round trip to the server.

The generated fetch client understands all the specifics of your API routes—the HTTP methods they support,
the parameters they expect, the structure of their request payloads, and the shape of their responses.
When you use this client, you get full TypeScript autocomplete for all these aspects,
making API consumption as type-safe as calling local functions.

## 🔍 Understanding the Generated Validation Code

When you enable validation with the TypeBox generator,
`KappaJS` generates validation code in your `lib` directory alongside other generated artifacts.

This code converts your TypeScript types into executable validation functions using the TypeBox library,
which in turn generates optimized validators based on JSON Schema.

You don't need to understand the generated code to use validation —
`KappaJS` integrates it into the request processing pipeline automatically.

However, understanding what happens under the hood can help you reason about performance characteristics
and troubleshoot issues if they arise.

For each validated type, the generator produces a JSON Schema representation and a compiled validator function.
The validator function is highly optimized —
it doesn't use generic validation logic that checks every possible JSON Schema keyword.

Instead, it's specifically tailored to validate the exact structure you defined,
with direct property checks and minimal overhead.

This compilation approach means validation is fast enough for production use.
The performance overhead of validation is typically negligible compared to other parts of request processing
like parsing, database queries, or business logic.
For most applications, the benefits of guaranteed data correctness far outweigh any performance cost.

The generated validation code lives in `lib` rather than in your source directories,
keeping your code focused on business logic.
When you build for production, this generated code is included in the bundle just like any other dependency.

