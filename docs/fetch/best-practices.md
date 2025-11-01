---
title: Fetch Client Best Practices
description: Best practices for using KappaJS fetch clients including module-level imports, form validation patterns, framework abstractions, and error handling strategies.
head:
  - - meta
    - name: keywords
      content: fetch best practices, form validation patterns, error handling, state management, loading states, validation optimization, api sync, tree shaking
---

### 💡 Best Practices for Using the Fetch Client

As you build applications with the generated fetch client, consider these patterns for effective usage.

Import fetch clients at the module level rather than within functions.
The imports are statically analyzable, enabling better tree-shaking and making dependencies clear.

Use the validation schemas for form validation to provide immediate feedback without server round trips.
This improves user experience and reduces server load.

When validating individual form fields on input events, use the performance optimization pattern
with a valid payload template to avoid unnecessary `errors` calls.

Wrap fetch clients in framework-specific abstractions
(hooks, resources, stores) that handle loading states, error states and caching
according to your application's patterns. The fetch client provides the type-safe foundation;
your application adds the state management layer.

Handle validation errors separately from other errors in your error handling logic.
Validation errors indicate client-side problems with data structure,
while other errors might indicate network issues or server problems.
These typically warrant different user-facing messages and retry strategies.

Remember that the fetch client's types and validation are derived from your API definitions.

When you change your API's parameter types, payload structure, or response shape,
the fetch client automatically updates to match.

This ensures your frontend and backend stay in sync without manual coordination.

