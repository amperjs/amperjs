---
title: Client-Side Validation
description: Automatic client-side validation with TypeBox schemas before network requests. Use check, errors, errorMessage methods for form validation with performance optimization patterns.
head:
  - - meta
    - name: keywords
      content: client validation, form validation, typebox, validation schemas, check method, validation errors, nested field validation, performance optimization, real-time validation
---

When you enable validation by adding a generator like the TypeBox generator,
the fetch client performs validation before making network requests.

This validation uses exactly the same schemas that validate on the server,
ensuring perfect consistency between what the client considers valid and what the server accepts.

Client-side validation happens automatically when you call fetch methods.

If parameters or payload don't match the expected types and constraints,
the client throws a validation error immediately without making a network request.

This provides instant feedback to users and prevents unnecessary server load from invalid requests.

## 🏗️ Validation Process

The validation process is transparent — you don't call validation functions explicitly.

You call the fetch method as you normally would, and validation happens behind the scenes:

```ts [pages/example/index.tsx]
// This validates that id is a number within the expected range
// and that the payload matches the expected structure
const response = await useFetch.POST([123], {
  name: "John Doe",
  email: "john@example.com",
});
```

If validation fails, you receive a detailed error explaining what went wrong.

This error handling integrates with your application's error boundaries or try-catch blocks,
letting you present validation feedback to users in your UI.

## 📋 Validation Schemas for Form Validation

Beyond automatic validation during fetch calls, the generated client exports validation schemas
that you can use directly in your UI code.

These schemas are particularly valuable for form validation,
where you want to check individual fields as users type or blur inputs,
providing immediate feedback without making server requests.

Each fetch client exports a `validationSchemas` object containing schemas for parameters, payloads, and responses.

These schemas are organized by HTTP method,
so you can validate the exact structure that a specific endpoint expects:

```ts [pages/example/index.tsx]
import useFetch from "@front/{api}/users/fetch";

// Access validation schemas
useFetch.validationSchemas.params;        // Parameter validation
useFetch.validationSchemas.payload.POST;  // POST payload validation
```

Each validation schema provides several methods with different performance characteristics and use cases.

## ✅ The `check` Method

The `check` method is a high-performance validation routine
that returns a boolean indicating whether data is valid.

This method is optimized for speed and can be called on every keystroke
or input event without degrading UI performance:

```ts [pages/example/index.tsx]
const isValid = useFetch.validationSchemas.payload.POST.check(formData);

if (!isValid) {
  // Show validation errors
}
```

Because `check` only returns true or false without generating detailed error information, it's extremely fast.
Use this as your first-line validation check.

Only when it returns false do you need to call heavier methods to get error details.

## ❌ The `errors` Method

When `check` returns false, you call the `errors` method to get detailed information about what failed validation.
This method returns an array of error entries, each describing a specific validation failure:

```ts [pages/example/index.tsx]
if (!useFetch.validationSchemas.payload.POST.check(formData)) {
  const errors = useFetch.validationSchemas.payload.POST.errors(formData);
  // errors is Array<ValidationErrorEntry>
}
```

Each error entry contains structured information about the validation failure:

```ts
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
```

The `path` property is particularly useful for form validation
because it tells you exactly which field failed.

You can filter errors by path to show field-specific error messages:

```ts [pages/example/index.tsx]
const payload = {
  name: formFields.name,
  email: formFields.email,
  age: formFields.age,
};

if (!useFetch.validationSchemas.payload.POST.check(payload)) {
  const errors = useFetch.validationSchemas.payload.POST.errors(payload);

  // Find error for specific field
  const emailError = errors.find(e => e.path === "email");
  if (emailError) {
    // Display emailError.message in the UI near the email field
  }
}
```

## 🪆 Handling Nested Field Paths

When working with nested objects, the `path` property uses friendly arrow notation ( → )
to represent the hierarchy, making error messages more readable for end-users.

For example, if your payload has nested structure:

```ts
const payload = {
  customer: {
    email: "invalid-email",
    address: {
      city: "London"
    }
  }
};
```

Validation errors will have `path` like:
- "customer → email" for the invalid email
- "customer → address → city" for city validation failures

**Match nested fields using regex with word boundaries:**

```ts [pages/example/index.tsx]
if (!useFetch.validationSchemas.payload.POST.check(payload)) {
  const errors = useFetch.validationSchemas.payload.POST.errors(payload);

  // Use regex with word boundary for precise field matching
  const emailError = errors.find(({ path }) => /\bemail\b/.test(path));

  if (emailError) {
    // Display error near the appropriate email field
  }
}
```

This human-readable approach ensures clear error messages
while maintaining precise field identification through regex matching.

## 📝 The `errorMessage` and `errorSummary` Methods

For simpler error handling scenarios, the validation schema provides two additional methods
that format errors into strings.

The `errorMessage` method formats all validation errors into a single human-readable message:

```ts
const message = useFetch.validationSchemas.payload.POST.errorMessage(formData);
// Example: "Validation failed: user: missing required properties: "email", "name";
//           password: must be at least 8 characters long"
```

The `errorSummary` method provides a brief overview of validation errors:

```ts
const summary = useFetch.validationSchemas.payload.POST.errorSummary(formData);
// Example: "2 validation errors found across 2 fields"
```

Both methods are heavier than `check` because they process error details,
so only call them after `check` returns false.

## ⚡ Performance Optimization for Form Validation

When validating individual form fields as users type, a subtle performance issue can arise.
The validation schemas validate entire objects, not individual properties.

If you're validating a partially-filled form,
the `check` method will return false for missing fields that haven't been filled yet,
not just for the field you're actually interested in validating.

Consider a form with three fields: name, email, and age.
When a user is typing in the name field, email and age are empty.
If you validate the entire payload:

```ts [pages/example/index.tsx]
const payload = {
  name: event.target.value,
  email: formFields.email,  // Empty
  age: formFields.age,      // Empty
};

if (!useFetch.validationSchemas.payload.POST.check(payload)) {
  // This will be false because email and age are missing
  // Now you'd call the expensive errors() method even though name might be valid
  const errors = useFetch.validationSchemas.payload.POST.errors(payload);
}
```

The `check` method returns false because of the missing fields,
causing you to call the much heavier `errors` method even when the field you care about (name) is perfectly valid.

On complex forms with many fields, this repeated calling of `errors` can noticeably degrade UI performance.

The solution is to provide a complete valid payload that includes placeholder values for all fields,
then override just the field you're validating:

```ts [pages/example/index.tsx]
// Manually define a valid payload where all required fields filled
// with contrived, yet valid values that always pass validation:
const validPayload = {
  name: "Valid Name",
  email: "valid@example.com",
  age: 25,
};

// When validating the name field, merge it with the valid payload
const payload = {
  ...validPayload,
  name: event.target.value,  // Override with actual value
};

if (!useFetch.validationSchemas.payload.POST.check(payload)) {
  // This only returns false if name itself is invalid
  const errors = useFetch.validationSchemas.payload.POST.errors(payload);
  const nameError = errors.find(e => e.path === "name");
  // Show nameError.message in UI
}
```

By providing valid values for all other fields,
you ensure that `check` only returns false when the specific field you're validating has issues.
This avoids unnecessary calls to the expensive `errors` method.

This optimization is subtle and most applications won't need it.
Forms with a few fields that validate on submit rather than on input events work fine with direct validation.

But for complex forms with many fields that validate as users type,
or for high-performance UI requirements, this pattern can make a significant difference.

**Important:** When you submit the form, make sure to validate the actual form data,
not the merged version with placeholder values.

The valid payload is only for input/blur event validation —
it ensures you're checking one field at a time efficiently.

For final submission, validate the complete actual payload:

```ts [pages/example/index.tsx]
// On form submit
const actualPayload = {
  name: formFields.name,
  email: formFields.email,
  age: formFields.age,
};

if (!useFetch.validationSchemas.payload.POST.check(actualPayload)) {
  const errors = useFetch.validationSchemas.payload.POST.errors(actualPayload);
  // Handle all validation errors
  return;
}

// Proceed with submission
await useFetch.POST([], actualPayload);
```
