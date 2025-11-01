---
title: API Server Endpoints
description: Learn how to build KappaJS API endpoints using defineRoute with Koa middleware, handle multiple HTTP methods (GET, POST, PUT, DELETE), and implement error handling with ctx.throw and ctx.assert.
head:
  - - meta
    - name: keywords
      content: koa endpoints, defineRoute, http methods, koa context, ctx.throw, ctx.assert, rest api, koa error handling, middleware composition
---

API endpoints in `KappaJS` are built using the `defineRoute` function,
which provides a structured way to handle HTTP methods, apply middleware,
and maintain type safety throughout your request-response cycle.

This system builds on Koa's middleware architecture
while adding `KappaJS`-specific enhancements for routing, validation, and type inference.

## ⇿ Basic Endpoint Structure

Every API endpoint must export a route definition as its default export.
You create this definition using the `defineRoute` function,
which accepts a factory function that returns an array of middleware.

The factory function receives a single argument – an object containing HTTP method builders
and the `use` function for custom middleware.

You typically destructure this object to access only the methods you need for that particular endpoint.

```ts [api/users/[id]/index.ts]
import { defineRoute } from "@front/{api}/users/[id]";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    // Handle GET requests
  }),
]);
```

This structure gives you a clear, declarative way to define which HTTP methods your endpoint supports.
Each method handler receives the Koa context object,
which `KappaJS` enhances with additional properties to make common tasks easier.

## ⥃ Working with Multiple HTTP Methods

Many endpoints need to handle multiple HTTP methods.
You define handlers for each method you want to support
by including them in the array returned from your factory function.

```ts [api/users/index.ts]
export default defineRoute(({ GET, POST, PUT, DELETE }) => [
  GET(async (ctx) => {
    // Retrieve resource
  }),

  POST(async (ctx) => {
    // Create resource
  }),

  PUT(async (ctx) => {
    // Update resource
  }),

  DELETE(async (ctx) => {
    // Delete resource
  }),
]);
```

The order in which you list these handlers doesn't matter –
`KappaJS` routes requests to the appropriate handler based on the HTTP method of the incoming request.

If a request comes in for a method you haven't defined,
`KappaJS` automatically responds with a 405 Method Not Allowed status.

The available method builders are HEAD, OPTIONS, GET, POST, PUT, PATCH, and DELETE,
covering all the standard HTTP methods you'll typically need in a REST API.

## ⚠️ Error Handling

`KappaJS` uses Koa's built-in error handling system, which provides a clean and flexible way to handle errors in your API endpoints.

### Using ctx.throw()

The primary way to return errors is using Koa's `ctx.throw()` method,
which throws an HTTP error with a specific status code and message:

```ts [api/users/[id]/index.ts]
export default defineRoute(({ GET, DELETE }) => [
  GET(async (ctx) => {
    const user = await fetchUser(ctx.params.id);

    if (!user) {
      ctx.throw(404, "User not found");
    }

    ctx.body = user;
  }),

  DELETE(async (ctx) => {
    const hasPermission = await checkPermission(ctx);

    if (!hasPermission) {
      ctx.throw(403, "Forbidden");
    }

    await deleteUser(ctx.params.id);
    ctx.status = 204;
  }),
]);
```

### Using ctx.assert()

For cleaner validation logic, use `ctx.assert()` which throws an error when a condition is falsy.
This is particularly useful for guard clauses and input validation:

```ts [api/books/[bookId]/index.ts]
export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    const { bookId } = ctx.params;

    // Validate format - throws 400 if condition is false
    const match = bookId.match(/^book-(\d+)$/);
    ctx.assert(match, 400, "Invalid book ID format");

    const id = match[1];
    const book = await fetchBook(id);

    // Throws 404 if book doesn't exist
    ctx.assert(book, 404, "Book not found");

    ctx.body = book;
  }),
]);
```

The `ctx.assert(condition, status, message)` pattern is especially useful for replacing verbose if-throw blocks
with concise one-liners, making your validation logic easier to read.

### Custom Error Handling

By default, Koa returns plain text error messages.
For API endpoints, you'll typically want to return JSON error responses instead.
You can add custom error handling middleware to format errors consistently across your application.

For more information about implementing custom error handlers and Koa's error handling capabilities,
refer to the [Koa documentation](https://koajs.com/#error-handling){target="_blank" rel="noopener"}.

