---
title: Features
description: Explore KappaJS features including multiple source folders, directory-based routing, end-to-end type safety, generated fetch clients, OpenAPI specs, and framework freedom for React, Solid, Vue, and Svelte.
head:
  - - meta
    - name: keywords
      content: typescript validation, vite multi-app, type-safe routing, fetch client generator, openapi 3.1, solidjs vite, react vite, koa middleware, runtime type checking, typescript api
---

`KappaJS` brings type-safe structure to full-stack development —
using Vite as the foundation for both frontend builds and API development,
with multiple source folders, directory-based routing, runtime validation,
and typed fetch clients — while keeping full framework freedom.

## 🗂️ Multiple Source Folders

Organize distinct concerns — public site, customer app, admin dashboard —
all connected yet independent in one Vite project.

**Why it matters:**

Different parts of your application have different needs.
Your marketing site serves static content, your customer app handles authentication and user data,
your admin panel requires different access patterns.

Cramming everything into one `src` folder creates organizational chaos as your app grows.

**How it works:**

Each source folder is a standalone entity with its own:
- Base URL and routing namespace
- Development server and port
- Vite configuration
- `api/` and `pages/` directories

**Benefits:**
- Work on one concern without loading everything else
- Deploy and scale each concern independently
- Different teams can own different source folders
- Clear boundaries prevent accidental cross-contamination

[Read more: Getting Started](/start#📁-create-your-first-source-folder)

---

## 🛣️ Directory-Based Routing

Your folder structure defines your routes. Works identically for both API endpoints and client pages.

**Why it matters:**

Keeping routing configuration separate from file structure creates friction.
You update a route path in config, but forget to rename the component.
Or you restructure files but miss updating the router.

Directory-based routing eliminates this drift — your filesystem *is* your routing configuration.

**How it works:**

Create a folder, add an `index.ts` file, and you have a route. The folder name becomes the URL path segment:

```
api/
  users/
    [id]/
      index.ts       → /api/users/:id
pages/
  users/
    [id]/
      index.tsx      → /users/:id
```

**Dynamic parameters:**
- `[id]` - Required parameter
- `[[id]]` - Optional parameter
- `[...path]` - Rest parameter (catches remaining segments)

**Benefits:**
- No separate routing configuration to maintain
- Refactoring means moving folders — routes update automatically
- Same pattern for API and pages — learn once, use everywhere
- URL structure matches code structure — easy to navigate

[Read more: Directory-Based Routing](/routing/intro)

---

## 🛡️ End-to-End Type Safety

Write TypeScript types once, get runtime validation automatically. No separate schemas to maintain.

**Why it matters:**

TypeScript provides compile-time type checking,
but can't protect you at runtime when HTTP requests arrive with unpredictable data.

Traditional solutions require maintaining separate validation schemas (Zod, Yup, io-ts) alongside your TypeScript types —
doubling your maintenance burden and creating opportunities for drift.

**How it works:**

Define your types once in TypeScript and `KappaJS` generates runtime validators automatically:

```ts
// Define types once
export default defineRoute(({ POST }) => [
  POST<{
    email: TRefine<string, { format: "email" }>;
    age: TRefine<number, { minimum: 18, maximum: 120 }>;
    name: TRefine<string, { minLength: 1, maxLength: 100 }>;
  }>(async (ctx) => {
    // ctx.payload is validated before reaching here
    const { email, age, name } = ctx.payload;
    // All fields guaranteed to match their constraints
  }),
]);
```

Responses can be validated as well before sending to clients,
catching bugs where handlers return incomplete or malformed data:

```ts
type User = {
  id: number;
  email: string;
  name: string;
};

export default defineRoute(({ GET }) => [
  GET<never, User>(async (ctx) => {
    const user = await fetchUserFromDatabase();
    // ctx.body is validated as User before sending
    ctx.body = user;
    // If user is missing required fields or has wrong types,
    // validation error is thrown instead of sending bad data
  }),
]);
```

Also route parameters like `/users/[id]` are validated according to their refined types:

```ts
defineRoute<[TRefine<number, { minimum: 1 }>]>(({ GET }) => [
  GET(async (ctx) => {
    // ctx.typedParams.id is guaranteed to be a positive number
  }),
]);
```

**Benefits:**
- Single source of truth — types *are* validation
- No schema duplication or drift between types and validators
- Validation errors provide detailed feedback about what failed
- Compile-time and runtime safety from the same definitions
- Changes to types automatically update all validation

[Read more: Validation](/validation/intro)

---

## 🔗 Generated Fetch Clients + OpenAPI Spec

Fully-typed fetch clients with client-side validation.
Invalid requests never reach your server. Complete OpenAPI documentation generated automatically.

**Why it matters:**

Building type-safe API consumption layers is tedious.
You write backend types, then manually create fetch functions,
then duplicate validation logic client-side, then maintain OpenAPI docs separately.
Each layer is an opportunity for bugs and drift.

**How it works:**

For every API route you define, `KappaJS` generates:

**1. Typed fetch clients:**

```ts
import useFetch from "@front/{api}/users/[id]/fetch";

// Fully typed, validates before making request
const user = await useFetch.GET([123]);
// TypeScript knows user's shape
console.log(user.name, user.email);
```

**2. OpenAPI 3.1 schemas:**
```json
{
  "openapi": "3.1.0",
  "paths": {
    "/api/users/{id}": {
      "get": {
        "parameters": [...],
        "responses": {...}
      }
    }
  }
}
```

**Client-side validation:**

Invalid data is caught immediately without server round trips:

```ts
// This validates payload client-side
await useFetch.POST([invalidId], invalidPayload);
// Throws ValidationError before making network request
```

**Benefits:**
- Perfect sync between backend and frontend
- Client-side validation reduces server load
- OpenAPI docs stay current automatically
- Type safety flows through your entire stack

[Read more: Fetch Clients](/fetch/intro) · [OpenAPI Generator](/generators/openapi/intro)

---

## 🎨 Framework Freedom

Use any frontend framework — SolidJS, React, Vue, Svelte, or none.
Generators make common choices convenient.

**Why it matters:**

Full-stack frameworks often lock you into specific frontend choices.
Next.js assumes React. Nuxt assumes Vue. SvelteKit assumes Svelte.

`KappaJS` is a Vite template, not a framework — you choose your frontend stack.

**How it works:**

**Built-in generators for:**
- **SolidJS** - Routing, resources, type-safe navigation
- **React** - Component scaffolding, routing integration
- **Vue** - Coming soon (community contribution welcome!)
- **Svelte** - Coming soon (community contribution welcome!)

**Example with SolidJS:**
```ts
// Install generator
npm install -D @kappajs/solid-generator

// Configure in vite.config.ts
import solidGenerator from "@kappajs/solid-generator";

export default {
  plugins: [
    devPlugin(apiurl, {
      generators: [solidGenerator()],
    }),
  ],
}
```

**Benefits:**
- Choose the right tool for each source folder
- Not locked into vendor decisions
- Generators are optional — use what you need
- Framework ecosystem compatibility

[Read more: Framework Setup](/start) · [SolidJS Generator](/generators/solid/intro)

---

## 🔧 Built on Proven Tools

Koa for APIs, Vite for frontend, TypeScript for safety. No proprietary abstractions.

**Why it matters:**

New frameworks introduce new abstractions, new APIs to learn, new mental models to internalize.
When the framework fades, your knowledge doesn't transfer.

`KappaJS` uses tools you already know (or should know) — Koa, Vite, TypeScript — and just provides organizational structure.

**The stack:**

**Koa for APIs:**
- Minimal, composable middleware model
- Well-understood patterns (10+ years mature)
- Rich ecosystem of middleware
- Standard Node.js deployment

**Vite for frontend:**
- Fast dev server with HMR
- Optimized production builds
- Framework-agnostic
- Modern JavaScript ecosystem

**TypeScript for type safety:**
- Industry standard for type-safe JavaScript
- Excellent tooling and editor support
- Types flow through to validation and clients

**Benefits:**
- Learn once, use everywhere
- No vendor lock-in or proprietary APIs
- Deep ecosystem of tools and libraries
- Skills transfer to other projects

You're not learning "the `KappaJS` way" — you're learning industry-standard tools with good organizational structure.

[Read more: API Server](/api-server/intro)

---

<div class="text-center">
  <LinkButton href="/start">Get Started</LinkButton>
</div>

