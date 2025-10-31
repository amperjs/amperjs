# ϰ KappaJS

### Structured Vite Template for building type-safe full-stack apps.

Multiple source folders. Directory-based routing. Runtime validation.
Generated fetch clients. Any framework.

📘 [Documentation → kappajs.dev](https://kappajs.dev)

---

## 🎯 What is `KappaJS`?

It's a **structured Vite template** that gives your Vite project a scalable shape:

* Multiple **source folders** for distinct areas (website, admin dashboard, API).
* Each folder splits into **`api/` and `pages/`**, creating a clean boundary between server and client.
* **Generators** that produce validation schemas, fetch clients, and OpenAPI specs from your TypeScript types.
* **Framework freedom** — works with SolidJS, React, Vue, Svelte, or anything Vite supports.

📘 [Learn more](https://kappajs.dev/about)

---

## 🚀 Getting Started

Create a new `KappaJS` project:

```sh
npx @kappajs/create
```

Navigate to your app dir and install dependencies with your preferred package manager:

```sh
npm install
# or pnpm install / yarn install
```

Create a source folder - run `npx @kappajs/create` inside app dir:

```sh
npx @kappajs/create
```

Start the dev server by passing the source folder name, for example:

```sh
vite @front
```

Each source folder runs on its own port and must be started with a separate command.

📘 [Learn more](https://kappajs.dev/start)

---

## ✨ Features

* **🗂️ Multiple Source Folders**<br>
    Organize distinct concerns — public site, customer app, admin dashboard — all connected in one Vite project.

* **🛣️ Directory-Based Routing**<br>
    Your folder structure defines your routes. Works identically for both API endpoints and client pages

* **🛡️ End-to-End Type Safety**<br>
    Write TypeScript types once, get runtime validation automatically. No separate schemas to maintain.

* **🔗 Generated Fetch Clients + OpenAPI spec**<br>
    Fully-typed fetch clients with client-side validation. Invalid requests never reach your server.

* **🎨 Framework Freedom**<br>
    Use any frontend framework — SolidJS, React, Vue, Svelte, or none.

* **🔧 Built on Proven Tools**<br>
    Koa for APIs, Vite for frontend, TypeScript for safety. No proprietary abstractions.

📘 [Learn more](https://kappajs.dev/features)

---

## 🧭 Example Use Cases

* Monorepo-like projects where frontend and API must live side by side.
* Teams needing **strong typing and runtime validation** without duplicating schemas.
* Developers who want **framework freedom** while keeping consistent structure.
* Projects that must scale from prototype → production with a deterministic structure.

---

## 🛠️ Contributing

Contributions are welcome!
Check out the [issues](https://github.com/kappajs-dev/kappajs/issues) and submit PRs.
Please follow the project's coding style and include tests when possible.

---

## 📄 License

MIT © [Slee Woo](https://github.com/kappajs-dev/kappajs/blob/main/LICENSE)

