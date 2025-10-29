---
layout: home

hero:
  name: AmperJS
  text: "<span class=\"text-nowrap\">Structured Vite Template</span>"
  tagline: Build scalable full-stack apps.<br>Multiple source folders. Directory-based routing. Runtime validation. Generated fetch clients.<br>Any framework.
  actions:
    - theme: brand
      text: Get Started
      link: /start/
    - theme: alt
      text: Explore Features
      link: /features/

features:
  - icon: 🗂️
    title: Multiple Source Folders
    details: Organize distinct concerns — public site, customer app, admin dashboard — all connected in one Vite project.
    link: /features/#🔹-multiple-source-folders-with-clear-separation

  - icon: 🛣️
    title: Directory-Based Routing
    details: Your folder structure defines your routes. Works identically for both API endpoints and client pages.
    link: /routing/

  - icon: 🛡️
    title: End-to-End Type Safety
    details: Write TypeScript types once, get runtime validation automatically. No separate schemas to maintain.
    link: /validation/

  - icon: 🔗
    title: Generated Fetch Clients + OpenAPI spec
    details: Fully-typed fetch clients with client-side validation. Invalid requests never reach your server.
    link: /fetch/

  - icon: 🎨
    title: Framework Freedom
    details: Use any frontend framework — SolidJS, React, Vue, Svelte, or none.
    link: /start/#🎨-choosing-your-frontend-framework

  - icon: 🔧
    title: Built on Proven Tools
    details: Koa for APIs, Vite for frontend, TypeScript for safety. No proprietary abstractions.
    link: /api-server/

---

## 🎯 What Is `AmperJS`?

`AmperJS` is a **structured Vite template** that keeps your full-stack concerns aligned.

Rather than inventing yet another framework, `AmperJS` integrates proven tools —
TypeScript, Vite, Koa, and your frontend framework — into a clear organizational pattern.
Separation of concerns isn't something you have to remember — it's built into the structure.

No proprietary abstractions. No new paradigms to learn. Just thoughtful structure around tools you already know.

📘 [Learn more](/about)

---

## 📦 Organizational Structure

**Multiple source folders** for distinct concerns — each with its own API and pages directories:

- Public marketing site at `/`
- Customer application at `/app`
- Admin dashboard at `/admin`

All in one project, each with independent routing and configuration, yet sharing types and validation logic.

**API/Pages separation** keeps server and client code from mixing.
Your directory structure enforces boundaries that code review can't.

📘 [Getting started](/start) · [Directory-based routing](/routing/)

---

## 🛡️ Type Safety & Validation

`AmperJS` extends TypeScript's compile-time safety to runtime.
Your type definitions become validation schemas automatically — no duplication, no drift.

Define parameter types, payload structures, and response shapes once. `AmperJS` generates:
- Runtime validators for your API
- Typed fetch clients for your frontend
- Client-side validation that catches errors before requests

Everything stays aligned because everything derives from the same source of truth.

📘 [Type safety overview](/api-server/type-safety/params) · [Validation](/validation/) · [Payload validation](/validation/payload)

---

## ⚡ Generated Fetch Clients

Every API route gets a fully-typed fetch client with built-in validation. Your frontend knows exactly what parameters each endpoint expects, what payload structure it accepts, and what response shape it returns.

Invalid data is caught client-side, before network requests. Your API never processes malformed requests.

📘 [Fetch clients intro](/fetch/) · [Getting started](/fetch/start) · [Client-side validation](/fetch/validation)

---

## ⚙️ API Development

Build APIs directly inside Vite's dev server with hot-reload support.

**Slot-based middleware** gives you fine-grained control — override global middleware per endpoint, compose request handling precisely, maintain consistent patterns across routes.

Development and production use the same structure — what you build locally is what deploys.

📘 [Dev workflow](/api-server/development-workflow) · [Middleware patterns](/api-server/use-middleware/)

---

## 🧰 Generators

Enable features by adding generators to your Vite config:

- **Validation schemas** from TypeScript types
- **Typed fetch clients** for every API route
- **OpenAPI 3.1 specs** generated automatically
- **Framework integration** (SolidJS, React, 🚧 with Vue / Svelte coming soon)

Each generator watches your code and updates artifacts as you develop.

📘 [Generators overview](/generators/) · [SolidJS generator](/generators/solid/) · [OpenAPI generator](/generators/openapi/)

---

## 🚀 Production Ready

`vite build` produces deployment-ready output — bundled API server and optimized frontend assets.

Deploy to any Node.js environment: traditional servers, containers, serverless platforms, or edge runtimes.

📘 [Production build guide](/api-server/building-for-production)

---

## 🧠 Philosophy

**Structure without constraints.**

`AmperJS` is opinionated about organization but unopinionated about implementation.
Clear boundaries between API and pages. Obvious locations for shared types and utilities.
Separation of concerns built into the filesystem.

You choose your frontend framework, state management, styling approach, database, and everything else.<br>
The structure scales; your choices remain free.

📘 [About AmperJS](/about) · [Features](/features)

