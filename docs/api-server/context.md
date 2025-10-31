---
title: API Server - Context Object
description: API Server - Context Object
---

### 🔧 The Enhanced Context Object

`KappaJS` extends the standard [Koa context](https://koajs.com/#context){target="_blank" rel="noopener"}
context with two helpful additions that streamline how you access request data and route parameters.

The `ctx.payload` property provides normalized access to incoming data.
For POST, PUT, and PATCH requests, this is the parsed request body (typically JSON).

For GET, DELETE, and other methods that don't conventionally have bodies,
this is the query string parameters.

This normalization means you can write code that accesses `ctx.payload` consistently,
regardless of the HTTP method, simplifying your handlers when methods share validation or processing logic.

The `ctx.typedParams` property gives you access to route parameters with full TypeScript type information.
This is similar to the standard `ctx.params` that Koa provides,
but with the benefit of type refinement based on your route's parameter definitions.

When you specify that a route parameter should be a number or a specific string union,
`ctx.typedParams` reflects those types accurately.

```ts [api/example/index.ts]
export default defineRoute(({ GET, POST }) => [
  GET(async (ctx) => {
    // For GET requests, ctx.payload contains query parameters - ctx.query
    const { filter, page } = ctx.payload;
  }),

  POST(async (ctx) => {
    // For POST requests, ctx.payload contains the parsed body - env.request.body
    const { name, email } = ctx.payload;
  }),
]);
```

