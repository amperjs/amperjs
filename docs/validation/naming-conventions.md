---
title: Validation Naming Conventions
description: Avoid TypeScript built-in type names like Event, Response, Request, Error when defining types for validation. Use suffix T or prefix T conventions to prevent runtime validation failures.
head:
  - - meta
    - name: keywords
      content: naming conventions, type naming, built-in types, naming conflicts, EventT, ResponseT, validation types, typescript conventions
---

When defining types that will be used for runtime validation,
avoid using names that conflict with TypeScript/JavaScript built-in types.

Type names like `Event`, `Response`, `Request`, `Error`, or `Element`
may work fine at compile time, but cause issues during runtime validation.

## ⚠️ Why This Matters

When `KappaJS` flattens types for validation schema generation,
built-in names are referenced as-is rather than being resolved to their definitions.

This prevents the validator from understanding the actual structure,
causing validation to fail at runtime.

The type system at compile time understands context and scope,
but the runtime validator needs explicit type definitions it can analyze.

## 🚫 Problematic Naming

```typescript
type Event = {
  id: number;
  name: string;
  timestamp: string;
};

// This compiles but fails runtime validation
export default defineRoute(({ POST }) => [
  POST<Event>(async (ctx) => {
    // Validation will fail because Event is treated as built-in DOM Event
    // The validator doesn't see your custom definition
  }),
]);
```

## ✅ Recommended Naming

```typescript
type EventT = {
  id: number;
  name: string;
  timestamp: string;
};

// Or with prefix
type TEvent = {
  id: number;
  name: string;
  timestamp: string;
};

// Runtime validation works correctly
export default defineRoute(({ POST }) => [
  POST<EventT>(async (ctx) => {
    // Validation succeeds with your custom type
  }),
]);
```

Use suffixes like `T` (e.g., `EventT`, `ResponseT`, `DataT`)
or prefixes like `T` (e.g., `TEvent`, `TResponse`, `TData`)
to avoid conflicts with built-in types.

Both conventions are widely used in the TypeScript community.
Choose one and use it consistently throughout your project.

## 📋 Common Built-ins to Avoid

**DOM and Browser APIs:**
- `Event`, `Element`, `Document`, `Window`, `Node`
- `HTMLElement`, `SVGElement`, `Text`, `Comment`
- `EventTarget`, `EventListener`, `CustomEvent`

**Web APIs:**
- `Response`, `Request`, `Headers`, `Body`
- `Blob`, `File`, `FormData`, `URLSearchParams`
- `WebSocket`, `MessageEvent`, `CloseEvent`

**JavaScript Built-ins:**
- `Error`, `TypeError`, `RangeError`, `SyntaxError`
- `Date`, `RegExp`, `Promise`, `Symbol`
- `Map`, `Set`, `WeakMap`, `WeakSet`
- `Array`, `Object`, `String`, `Number`, `Boolean`

**TypeScript Utility Types:**
- `Partial`, `Required`, `Readonly`, `Pick`, `Omit`
- `Record`, `Exclude`, `Extract`, `NonNullable`
- `Parameters`, `ReturnType`, `InstanceType`

**Node.js Types:**
- `Buffer`, `Stream`, `EventEmitter`
- `Timeout`, `Immediate`, `Timer`

## 🔍 Complete Reference

For a comprehensive list of all built-in types to avoid,
check the [tsuit library](https://github.com/sleewoo/tsuit/blob/main/src/builtins.ts){target="_blank" rel="noopener"}
that `KappaJS` uses for type flattening.

## 💡 Best Practices

**Establish a naming convention early** in your project and document it.
Whether you choose `TypeT` or `TType`, consistency matters more than the specific pattern.

**Use descriptive names** that indicate the type's purpose.
`UserEventT` is better than `EventT` if it's specific to user events.

**Consider domain prefixes** for complex projects.
`ApiResponseT`, `DbRecordT`, `UiComponentT` clearly indicate context.

**Review existing types** when adding validation to an established codebase.
Look for conflicts with built-in names that need renaming.

**Test your validation** after defining types.
If validation fails unexpectedly despite correct type definitions,
check for built-in name conflicts.

