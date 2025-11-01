---
title: API Server Best Practices
description: Best practices for organizing KappaJS API endpoints including handler responsibilities, middleware slots, type declarations, validation patterns, and middleware ordering strategies.
head:
  - - meta
    - name: keywords
      content: koa middleware, api organization, endpoint best practices, typescript api patterns, middleware ordering, DRY principles, koa context typing
---

### 💡 Best Practices for Endpoint Organization

As you build out your API, consider these patterns for keeping your endpoints maintainable and consistent.

Keep method handlers focused on their specific responsibilities.
If you find a handler becoming very long, that's a sign you should extract logic into separate functions
that your handler calls. Your endpoint file orchestrates the request-response cycle;
the heavy lifting of business logic should live in modules that your endpoint imports.

Use slots consistently. When you override global middleware,
always use the same slot names that were established in `core/api/use.ts`.
This consistency makes it easy to understand what behavior you're changing when you review a route file later.

Leverage the global type declarations in `core/api/env.d.ts` for properties that appear across multiple endpoints.
Only use route-specific type arguments when something is truly unique to that endpoint.
This keeps your codebase DRY and makes refactoring easier.

Group related validation and transformation logic into middleware functions
rather than repeating it across method handlers.
If multiple methods need the same data validation or transformation,
a `use` middleware that runs for all of them is cleaner than duplicating the logic.

Consider the order of your middleware carefully.
Authentication should typically run before authorization, which should run before business logic.
Error handling middleware should be early in the chain so it can catch errors from subsequent middleware.
These patterns apply to both global middleware in `core/api/use.ts` and route-specific middleware.

