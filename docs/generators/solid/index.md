---
title: Generators - SolidJS
description: Generators - SolidJS
---

The SolidJS generator integrates `KappaJS`'s directory-based routing
with SolidJS's reactive primitives and router.

This creates a seamless development experience where your page components
automatically become routes with full type safety and optimized loading patterns.

The generator handles routing configuration, generates type-safe navigation helpers
and provides utilities that work naturally with SolidJS's resource and suspense patterns.

## 🛠 Installation and Setup

Install the SolidJS generator as a development dependency.
Using the `-D` flag keeps it out of your production builds
since it's only needed during development:

::: code-group

```sh [npm]
npm install -D @kappajs/solid-generator
```

```sh [pnpm]
pnpm install -D @kappajs/solid-generator
```

```sh [yarn]
yarn add -D @kappajs/solid-generator
```
:::

Register the generator in your source folder's `vite.config.ts`:

```ts [vite.config.ts]
import solidPlugin from "vite-plugin-solid";
import devPlugin from "@kappajs/dev";
import solidGenerator from "@kappajs/solid-generator";
import defineConfig from "../vite.base";

export default defineConfig(import.meta.dirname, {
  // ...
  plugins: [
    solidPlugin(),
    devPlugin(apiurl, {
      generators: [
        solidGenerator(),
        // other generators ...
      ],
    }),
  ],
})
```

Once configured, the generator adds several files to the root of your source folder
that form the foundation of your SolidJS application.

## 🗂️ Working with Multiple Source Folders

If your application uses multiple source folders,
each folder can have its own SolidJS generator configuration
producing its own independent application structure.

One source folder might be your main application
while another is an admin dashboard,
each with its own routing, components, and data fetching patterns.

The generated types and utilities are scoped to each source folder,
so there's no collision or confusion between them.

Your main app's routes don't appear in your admin dashboard's LinkProps type,
and vice versa.

Each application maintains its own namespace
while sharing the underlying `KappaJS` organizational principles.

