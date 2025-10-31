---
title: Getting Started
description: Getting Started
---

**Starting your `KappaJS` journey is a breeze!** ✨

In just a few commands, you'll have a fully-configured Vite project ready to scale with your application's needs.

Begin your project with a solid foundation. `KappaJS` provides a structured
yet flexible starting point designed for real-world applications with multiple concerns.

## 🚀 Create Your Application

Run the following command to create a new `KappaJS` application:

```bash
npx @kappajs/create
```

You'll be asked for an app name (required) and a dist directory (optional, defaults to `.dist`).
This creates a folder with your app name containing a Vite project ready for multiple source folders.

Now it's time to install dependencies. Navigate to your application directory and run:

::: code-group

```sh [npm]
npm install
```

```sh [pnpm]
pnpm install
```

```sh [yarn]
yarn install
```
:::

## 📁 Create Your First Source Folder

Unlike standard Vite templates, `KappaJS` doesn't create a source folder immediately.
Instead, it gives you the tools to create as many source folders as your application needs,
each organized around a specific concern.

Navigate to your application directory and run `npx @kappajs/create` again:

```bash
cd your-app-name
npx @kappajs/create
```

You'll configure three things. The folder name is required and determines what your source folder will be called
(use `@` prefix like `@front` for cleaner imports).

> The base URL is optional and defaults to `/`, determining where this folder's routes will be served.
The port is optional and defaults to `4000`, setting where the dev server runs for this folder.

Start the dev server by passing the source folder name, for example:

```sh
vite @front
```

Each source folder runs on its own port and must be started with a separate command.

### Example: Creating a main frontend folder

```bash
npx @kappajs/create
# folder name: @front
# baseurl: /
# port: 4000
```

This creates the following structure:

```
@front/
├── config/
│   └── index.ts
├── api/
└── pages/
```

The `config/index.ts` file contains two exports that define how this source folder behaves:

```ts [config/index.ts]
export const baseurl = "/";
export const apiurl = "/api"; // relative to baseurl
```

Here's how this works: Vite serves your client-side pages from the base URL.

When a request matches the API URL pattern (anything starting with `/api/` in this case),
middleware intercepts it and forwards it to a Koa server that handles your API routes.

This means you get Vite's hot module replacement for client code
and a proper Node.js environment for API code, running together seamlessly.

## 🎨 Choosing Your Frontend Framework

Since `KappaJS` is just a structured Vite template, you can use any frontend framework that works with Vite.
To make this easier, `KappaJS` provides generators for common frameworks:

::: code-group

```sh [npm]
npm install -D @kappajs/solid-generator
#              @kappajs/react-generator
```

```sh [pnpm]
pnpm install -D @kappajs/solid-generator
#               @kappajs/react-generator
```

```sh [yarn]
yarn add -D @kappajs/solid-generator
#           @kappajs/react-generator
```
:::

🚧 **Vue / Svelte** - Coming soon

Configure them in your source folder's `vite.config.ts`:

```ts [vite.config.ts]
import devPlugin from "@kappajs/dev";
import solidGenerator from "@kappajs/solid-generator";

export default {
    devPlugin(apiurl, {
      generators: [
        solidGenerator(),
        // ...other generators
      ],
    }),
}
```

The generator automatically writes framework-appropriate boilerplate when you create new page files.

If you prefer a different framework or want to configure Vite manually,<br>
you're free to do so — generators are conveniences, not requirements.

You can even write your own generator plugin following standard Vite plugin patterns.

## 🛣️ Directory-Based Routing

`KappaJS` derives routes from your directory structure.
Your folder names become URL path segments, and each route needs an `index.ts` file
that serves as the endpoint (for API) or component (for pages).

The base route lives in a folder named `index`.
For an API route, that's `api/index/index.ts`,
and for a client route, it's `pages/index/index.ts`.

This consistency means every route follows the same pattern.
([Details](/routing/))

## 🔀 Dynamic Parameters

`KappaJS` supports three types of dynamic route segments, using syntax inspired by solid-start
that works the same way for both API and client routes. ([Details](/routing/params))

Required parameters use single brackets like `[id]` and match exactly one path segment.
A route at `users/[id]/index.ts` matches `/users/123` but not `/users` or `/users/123/posts`.

Optional parameters use double brackets like `[[id]]` and match whether or not that segment is present.
A route at `users/[[id]]/index.ts` matches both `/users` and `/users/123`.

Rest parameters use the spread syntax `[...path]` and match any number of additional segments.
A route at `docs/[...path]/index.ts` matches `/docs/getting-started`, `/docs/api/reference/types`,
or any other path under `/docs`. ([Details](/routing/params))

## ⚡ Auto-Generated Routes

When you create a new route file, `KappaJS` detects it and instantly generates appropriate starter code.
([Details](/routing/generated-content))

**For an API route at `api/users/[id]/index.ts`:**

```ts [api/users/[id]/index.ts]
import { defineRoute } from "@front/{api}/users/[id]";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = "Automatically generated route: [ users/[id] ]"
  }),
]);
```

The `defineRoute` function comes from a generated module that includes type information about your route parameters.
The function receives HTTP method helpers (GET, POST, PUT, DELETE, etc.), and each handler gets a Koa context object.
Replace the placeholder message with your actual logic.

**For a client route at `pages/users/[id]/index.tsx` (using SolidJS):**

```ts [pages/users/[id]/index.tsx]
export default function Page() {
  return <div>Automatically generated Solid Page: [ users/[id] ]</div>;
}
```

This gives you a working component immediately.
The generator adapts to your chosen framework, producing appropriate code.

## 🏗️ Multiple Source Folders

The power of `KappaJS`'s structure becomes clear when you need to organize a larger application.
Consider a SaaS product with a marketing site, customer-facing app, and admin dashboard.
Instead of cramming these into a single source directory, create separate source folders:

```bash
npx @kappajs/create
# folder name: @admin
# baseurl: /admin
# port: 4001
```

```bash
npx @kappajs/create
# folder name: @marketing
# baseurl: /
# port: 4002
```

Each source folder is independent. It has its own base URL so routes are automatically prefixed correctly.

It runs on its own port during development so you can run multiple folders simultaneously.

It can use a different frontend framework if that makes sense for its specific needs.

It has its own `vite.config.ts` for independent configuration.

Most importantly, each folder's code is completely encapsulated in its own `api` and `pages` directories.

This isn't just organizational convenience. As your application grows,
this structure prevents the tangling of concerns that makes codebases difficult to maintain.

You're not working around limitations of your build tool —
you're working with a structure designed for this pattern from the beginning.

## 📂 Project Structure Example

Here's what a complete `KappaJS` project looks like with multiple source folders:

```
my-app/
├── @front/
│   ├── config/
│   ├── api/
│   │   ├── index/
│   │   │   └── index.ts
│   │   └── users/
│   │       └── [id]/
│   │           └── index.ts
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.ts
│   │   └── users/
│   │       └── [id]/
│   │           └── index.ts
│   └── vite.config.ts
├── @admin/
│   ├── config/
│   ├── api/
│   ├── pages/
│   └── vite.config.ts
├── lib/
│   ├── @front/
│   └── @admin/
└── package.json
├── tsconfig.json
└── vite.base.ts
```

The `lib` directory contains generated code that `KappaJS` maintains for you
— type definitions and helpers based on your route structure.
You don't edit these files directly.

Your actual code lives in the source folders (`@front`, `@admin`),
and the TypeScript path mappings make everything import cleanly.

## 📝 TypeScript Path Mapping

When you create a source folder, `KappaJS` automatically updates your `tsconfig.json` with path mappings:

```json [tsconfig.json]
{
  "compilerOptions": {
    "paths": {
      "@front/*": ["./@front/*", "./lib/@front/*"],
      "@/*": ["./*", "./lib/*"]
    }
  }
}
```

Each mapping points to two locations. The first is your source folder where you write code.
The second is the `lib` directory where `KappaJS` places generated TypeScript types and helper functions.

This separation keeps your source directories clean —
you focus on writing business logic while generated artifacts live elsewhere.

With these mappings, you can import from both your code and generated types using the same clean syntax:

```ts
// Generated route helper from lib
import { defineRoute } from "@front/{api}/users/[id]";

// Your own utility code
import { validateUser } from "@front/api/utils";
```

