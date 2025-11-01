---
title: Define Plugin
description: DefinePlugin provides fine-grained control over environment variables exposed to client code. Explicitly specify variables from process.env or .env files for security and clarity.
head:
  - - meta
    - name: keywords
      content: define plugin, environment variables, env vars, vite env, process.env, dotenv, client environment
---

### 🔧 The DefinePlugin

The DefinePlugin provides fine-grained control over environment variables
exposed to your client code.

Unlike Vite's default behavior of exposing all variables prefixed with `VITE_`,
DefinePlugin requires you to explicitly specify which variables to expose.

The plugin accepts an array of configuration objects:

```ts [vite.base.ts]
definePlugin([
  {
    // Extract from process.env and expose to client
    keys: ["DEBUG"],
  },
  {
    // Load from .env file
    file: resolve(import.meta.dirname, ".env"),
    keys: ["HOSTNAME"], // Only expose these keys
    use(key, val) {
      // Optional: do something with each key/value pair
      process.env[key] = val;
    },
  },
])
```

Each configuration object can specify:

**keys** - An array of environment variable names to expose.
These are read from `process.env` by default.

**file** - Path to an `.env` file to load variables from.
Variables from this file are only exposed if listed in `keys`.

**use** - An optional hook function that receives each key/value pair.
This is useful for side effects like setting variables in `process.env`
or logging configuration.

This explicit approach prevents accidental exposure of sensitive variables
and makes it clear which variables your client code depends on.

