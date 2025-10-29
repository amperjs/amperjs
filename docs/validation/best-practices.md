---
title: Validation - Best Practices
description: Validation - Best Practices
---

### 💡 Best Practices for Validation

As you build out your validated API, consider these patterns for maintaining a clean
and effective validation strategy.

Define your domain types once in a shared types directory, then reference them throughout your API routes.
This keeps validation logic centralized and ensures consistency across your API surface.
When you need to change what constitutes a valid user profile or post object,
you change it in one place and the validation updates everywhere.

Use `TRefine` liberally to express meaningful constraints on your data.
Don't just validate that an email field is a string—validate that it matches email format.
Don't just validate that an age is a number — validate that it's a positive integer within reasonable bounds.
These constraints prevent invalid data from entering your system and make your API's requirements explicit.

Write your types to represent valid states only.
Rather than allowing any combination of fields and using conditionals in your handler to check what's present,
use TypeScript's type system to encode which fields are required together.
Union types with discriminator fields, as we saw in the payment method example,
express conditional requirements at the type level where they're enforced by validation.

Consider response validation especially important for endpoints that return data
from external sources like databases or third-party APIs.
These sources might change their data shapes without warning,
and response validation catches these changes before they reach your users.

Keep the `core/api/error-handler.ts` file updated to match your application's error handling conventions.
Validation errors are just one type of error your API might encounter.
Handle them consistently with your other error types in terms of status codes, message formats, and logging.

When you encounter validation errors during development, read them carefully.
The error messages indicate which field failed validation and why.
This feedback helps you understand your API's requirements and often reveals misunderstandings
about data structures early in the development process.

