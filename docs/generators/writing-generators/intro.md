---
title: Writing Custom Generators
description: Create custom KappaJS generators to produce code based on route structure and types. Learn generator architecture, worker threads, and the GeneratorConstructor structure.
head:
  - - meta
    - name: keywords
      content: custom generators, vite plugin development, generator api, worker threads, code generation, plugin architecture, GeneratorConstructor, devlib
---

Generators are plugins that produce code based on your route structure and types.

While `KappaJS` provides built-in generators for common needs,
you can create custom generators tailored to your specific requirements.

## Understanding the Architecture

At the core, a worker thread parses your `api/` and `pages/` directories
and sends resolved route entries to all registered generators.

Generators receive route information and generate files accordingly —
type definitions, helper functions, documentation, or anything else
your project needs.

## Generator Structure

A generator is a module that exports a default function
returning a `GeneratorConstructor` object:

```ts
import type { GeneratorConstructor } from "@kappajs/devlib";
import { factory } from "./factory";

export default (): GeneratorConstructor => {
  return {
    name: "MyGenerator",
    moduleImport: import.meta.filename,
    moduleConfig: undefined,
    factory,
  };
};
```

### Generator Constructor Properties

**name** - Unique identifier for your generator, used in logs and debugging.

**moduleImport** - Path to the generator module.
Use `import.meta.filename` to reference the current file.
This is needed because generators run in worker threads
where functions can't be directly passed.

**moduleConfig** - Configuration options passed to your generator.
Can be any JSON-serializable value or `undefined`.

**factory** - The actual generator implementation function.
This receives plugin options and returns a watch handler.

**options** (optional) - Generator-specific options:
- `resolveTypes?: boolean` - When `true`, `KappaJS` resolves all type references
  to their flattened representations before calling your generator,
  providing complete type information for validation or documentation.

