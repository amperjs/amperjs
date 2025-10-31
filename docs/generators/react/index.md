---
title: Generators - React
description: Generators - React
---

The React generator seamlessly connects `KappaJS`'s file-system routing to React's rendering system and router implementation.

This enables a fluid development experience where page components are automatically registered as routes
with end-to-end type safety and efficient loading strategies.

The generator automates routing configuration, generates navigation utilities with type checking,
and supplies helpers that naturally align with React's Suspense boundaries and data fetching patterns.

## 🛠 Installation and Setup

Install the React generator as a development dependency.
Using the `-D` flag keeps it out of your production builds
since it's only needed during development:

::: code-group

```sh [npm]
npm install -D @kappajs/react-generator
```

```sh [pnpm]
pnpm install -D @kappajs/react-generator
```

```sh [yarn]
yarn add -D @kappajs/react-generator
```
:::

Register the generator in your source folder's `vite.config.ts`:

```ts [vite.config.ts]
import reactPlugin from "@vitejs/plugin-react";
import devPlugin from "@kappajs/dev";
import reactGenerator from "@kappajs/react-generator";
import defineConfig from "../vite.base";

export default defineConfig(import.meta.dirname, {
  // ...
  plugins: [
    reactPlugin(),
    devPlugin(apiurl, {
      generators: [
        reactGenerator(),
        // other generators ...
      ],
    }),
  ],
})
```

Once configured, the generator adds several files to the root of your source folder
that form the foundation of your React application.

## 🗂️ Working with Multiple Source Folders

For projects organized across multiple source directories,
the React generator supports independent configuration for each location,
enabling separate application architectures to coexist.

You might maintain your core application in one directory
while operating an administrative panel from another,
each with dedicated routing systems, UI components, and data handling approaches.

Type definitions and utility functions generated for each directory remain completely isolated,
ensuring clean separation and preventing naming conflicts.

The route definitions from your main application won't appear in the admin interface's navigation types,
maintaining clear boundaries between different application domains.

While each application operates within its own namespace,
they all benefit from consistent `KappaJS` structural conventions.

