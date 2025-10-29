---
title: Validation - Error Handler
description: Validation - Error Handler
---

When route parameters, request payloads, or response data don't match the expected schema,
the validation generator throws a `ValidationError`.

This error contains detailed information about the validation failure,
including the scope (whether it was a parameter, payload, or response that failed)
and descriptive error messages.

Your `core/api/error-handler.ts` file catches these errors and handles them appropriately.

## 🚨 Default Error Handler

The default error handler checks if an error is a `ValidationError`
and returns a 400 Bad Request status:

```ts [core/api/error-handler.ts]
import { ValidationError } from "@amperjs/api";

// ...
if (error instanceof ValidationError) {
  const { scope, errorMessage } = error;
  return [400, `${scope}ValidationError: ${errorMessage}`];
}
```

This file is yours to customize.
You can modify how errors are formatted, add logging, implement custom error responses,
or handle specific error types differently.

Perhaps you want to return validation errors in a specific JSON format that your frontend expects.
Or maybe you want to log validation failures for monitoring purposes.

```ts [core/api/error-handler.ts]
if (error instanceof ValidationError) {
  const { scope, errorMessage } = error;

  // Log validation failures
  logger.warn("Validation failed", { scope, message: errorMessage });

  // Return a structured error response
  return [400, {
    error: "validation_error",
    scope,
    message: errorMessage,
    timestamp: new Date().toISOString(),
  }];
}
```

## 🔧 ValidationError Details

The ValidationError class provides rich, structured information when validation fails,
making error handling both precise and developer-friendly.

Here's the implementation imported from `@amperjs/api`:

```ts
export class ValidationError extends Error {
  public scope: ValidationErrorScope;
  public errors: Array<ValidationErrorEntry> = [];
  public errorMessage: string;
  public errorSummary: string;

  constructor([scope, { errors, errorMessage, errorSummary }]: [
    ValidationErrorScope,
    ValidationErrorData,
  ]) {
    super(JSON.stringify(errors, null, 2));
    this.name = `${scope}ValidationError`;
    this.scope = scope;
    this.errors = errors;
    this.errorMessage = errorMessage;
    this.errorSummary = errorSummary;
  }
}

export type ValidationErrorScope = "params" | "payload" | "response";

/**
 * Shape of individual validation errors emitted by generators.
 */
export type ValidationErrorEntry = {
  /** JSON Schema keyword that triggered the error (e.g. `format`, `maxItems`, `maxLength`). */
  keyword: string;
  /** JSON Pointer–style path to the invalid field (matches JSON Schema `instancePath`). */
  path: string;
  /** Human-readable error message. */
  message: string;
  /** Constraint parameters (e.g. `{ limit: 5 }`, `{ format: "email" }`). */
  params?: Record<string, unknown>;
  /** Optional error code for i18n/l10n or custom handling. */
  code?: string;
};

export type ValidationErrorData = {
  errors: Array<ValidationErrorEntry>;
  /**
   * Formats errors into a single human-readable message.
   * @example: Validation failed: user: missing required properties: "email", "name"; password: must be at least 8 characters long
   */
  errorMessage: string;
  /**
   * Gets a simple error summary for quick feedback.
   * @example: 2 validation errors found across 2 fields
   */
  errorSummary: string;
};
```

## 🔍 Working with ValidationError Properties

As seen in the implementation, a `ValidationError` instance provides several properties
for handling validation failures flexibly.

The `errors` property is an array of `ValidationErrorEntry` objects,
each describing a specific validation failure.

You can iterate through this array to collect error details and format them as needed:

```ts [core/api/error-handler.ts]
if (error instanceof ValidationError) {
  const { scope, errors } = error;

  // Collect all error messages
  const messages = errors.map(e => `${e.path}: ${e.message}`);

  return [400, {
    error: "validation_error",
    scope,
    fields: messages,
  }];
}
```

Or extract just the first error for a simple response:

```ts [core/api/error-handler.ts]
if (error instanceof ValidationError) {
  const { scope, errors } = error;
  const firstError = errors[0];

  return [400, {
    error: "validation_error",
    scope,
    field: firstError.path,
    message: firstError.message,
  }];
}
```

For convenience, the `errorMessage` property provides a human-readable message
containing all error messages concatenated:

```ts [core/api/error-handler.ts]
if (error instanceof ValidationError) {
  const { scope, errorMessage } = error;

  // errorMessage example:
  // "Validation failed: user: missing required properties: "email", "name";
  //  password: must be at least 8 characters long"

  return [400, errorMessage];
}
```

The `errorSummary` property offers a brief overview of validation failures:

```ts [core/api/error-handler.ts]
if (error instanceof ValidationError) {
  const { scope, errorSummary } = error;

  // errorSummary example: "2 validation errors found across 2 fields"

  logger.warn(`Validation failed in ${scope}: ${errorSummary}`);

  return [400, errorSummary];
}
```

The `scope` property tells you which part of the request failed validation:

- `"params"` - Route parameter validation failures
- `"payload"` - Request body validation failures
- `"response"` - Response validation failures (data your handler tried to return)

This granularity helps you provide targeted error messages to clients
and aids in debugging by pinpointing exactly where validation failed in the request lifecycle.

Each `ValidationErrorEntry` in the `errors` array contains:

- `keyword` - The JSON Schema validation rule that failed (e.g., "minLength", "format", "required")
- `path` - JSON Pointer-style path to the invalid field (e.g., "user.email", "items.0.name")
- `message` - A human-readable description of what went wrong
- `params` - Optional constraint details (e.g., `{ limit: 5 }` for a maxLength failure)
- `code` - Optional error code for internationalization or custom error handling

This structured information allows you to build sophisticated error responses
tailored to your application's needs, whether that's detailed field-level feedback for forms
or aggregated error summaries for API consumers.

