---
title: Development Workflow
description: Run multiple KappaJS source folders independently with separate dev servers, automatic API hot-reload, custom middleware routing, and resource cleanup with teardown handlers.
head:
  - - meta
    - name: keywords
      content: vite dev server, hot reload, esbuild, rolldown, api development, multiple ports, teardown handler, development middleware, file watching
---

Each source folder in `KappaJS` is a **standalone entity** with its own dev server, port, and configuration.

**Why this model?**

Different concerns in your application often have different needs.
Your public marketing site might need SSG capabilities, your customer app needs authentication flows,
and your admin panel requires different access patterns.
Running them on separate ports with independent configurations means:

- **Focused development** - Work on one concern without loading everything else
- **Independent scaling** - Deploy and scale each concern based on its traffic patterns
- **Team autonomy** - Different teams can own different source folders without conflicts
- **Clear boundaries** - Port separation reinforces the organizational structure — no accidental cross-contamination

The standalone model matches how these concerns will eventually deploy in production —
separate services on different base URLs—making your development environment reflect reality rather than abstract it away.

## 🚀 Starting the Dev Server

Run the dev server for a specific source folder:

```sh
vite @front
```

Replace `@front` with your source folder name (`@admin`, `@marketing`, etc.).

The dev server starts on the port configured in your source folder's `vite.config.ts` (default: 4000).

## 📂 Running Multiple Source Folders

Each source folder runs independently, so you can work on multiple concerns simultaneously:

```sh
# Terminal 1 - Customer app
vite @front           # Runs on port 4000

# Terminal 2 - Admin panel
vite @admin           # Runs on port 4001

# Terminal 3 - Marketing site
vite @marketing       # Runs on port 4002
```

Or set up `npm` scripts for convenience:

```json
{
  "scripts": {
    "dev:front": "vite @front",
    "dev:admin": "vite @admin",
    "dev:marketing": "vite @marketing"
  }
}
```

Then run: `npm run dev:front`

## 🔀 What Happens During Development

When you start a dev server, `KappaJS`:

1. **Builds your API** - Uses esbuild to compile `api/app.ts`
2. **Starts Vite's dev server** - Serves your client pages with HMR
3. **Integrates middleware** - Routes requests between Vite and your API
4. **Watches for changes** - Rebuilds API code automatically

### API Hot-Reload

When you modify API files, `KappaJS`:
- Detects the change via file watcher
- Waits for file stability (default: 1 second)
- Rebuilds the API bundle in a background worker thread
- Dynamically imports the new API handler
- Routes subsequent requests to the updated API

The rebuild typically completes in about a second, even on larger projects.
Your Vite dev server remains responsive during API rebuilds since they happen in a worker thread.

### Future: Waiting for Rolldown

The current build system uses `esbuild`, which is fast and reliable
but doesn't support HMR for server-side code.

`KappaJS` is watching the development of [Rolldown](https://rolldown.rs/),
a Rust-based bundler that aims to provide HMR capabilities for server-side builds.

Once Rolldown finalizes its API and reaches a stable release,
`KappaJS` plans to evaluate it as a replacement for esbuild.

HMR for API code would eliminate full rebuilds, preserve in-memory state across changes,
and further improve the development experience.

Until then, esbuild with full rebuilds provides a solid foundation
that works smoothly for most projects.

### Request Routing

By default, requests matching your `apiurl` configuration (e.g., `/api/*`) route to your API handler.
All other requests go to Vite's dev server for client assets.

This automatic routing means you develop your full-stack application with a single dev server
on a single port — no separate processes to manage.

## ⚙️ Custom Development Middleware

Your `api/app.ts` file can export two optional functions that customize development behavior.
Both are commented out by default — uncomment and adapt them as needed.

### DevMiddlewareFactory

This function lets you customize how requests are routed between your API handler and Vite's dev server:

```ts
/**
 * In dev mode, determines whether to pass the request to API handler or to Vite.
 */
export const devMiddlewareFactory: import("@kappajs/api").DevMiddlewareFactory = (
  app,
) => {
  return (req, res, next) => {
    return req.url?.startsWith("...")
      ? app?.callback()(req, res) // send request to api handler
      : next(); // send request to vite dev server
  };
};
```

By default, `KappaJS` routes requests based on your `apiurl` configuration. If you need more sophisticated routing logic—perhaps certain paths should bypass the API entirely, or you want to handle WebSocket connections differently—you can implement custom logic here.

### TeardownHandler

This function runs before the API handler reloads during development:

```ts
/**
 * In dev mode, used to cleanup before reloading api handler.
 */
export const teardownHandler: import("@kappajs/api").TeardownHandler = () => {
  // close db connections, server sockets etc.
};
```

Use this to clean up resources that shouldn't persist across rebuilds—close database connections, shut down WebSocket servers, clear timers, or release any other resources that would otherwise leak.

Without proper cleanup, repeated rebuilds during development can leave orphaned connections or processes that consume resources. The teardown handler ensures a clean slate before each reload.

**Example usage:**

```ts
let dbConnection;

export const teardownHandler = async () => {
  if (dbConnection) {
    await dbConnection.close();
    dbConnection = null;
  }
};
```

This pattern prevents database connection exhaustion during active development with frequent rebuilds.

## 💡 Development Best Practices

**Work on one source folder at a time** when making focused changes. No need to run everything if you're only working on the admin panel.

**Run multiple source folders** when working on integration points or testing cross-concern interactions.

**Use the stability threshold** setting if you're experiencing unnecessary rebuilds from your editor's save behavior:

```ts
// vite.config.ts
export default {
  server: {
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 1500, // Wait 1.5 seconds
      },
    },
  },
}
```

**Structure API code to minimize rebuild impact.** Keep expensive initialization
(database connections, external service clients) in functions called lazily rather than at module scope.
Use the teardown handler to clean up resources properly.

## ⚠️ Troubleshooting

**Port already in use?**
Check your source folder's `vite.config.ts` and change the port:

```ts
export default {
  server: {
    port: 4005, // Use different port
  },
}
```

**API not rebuilding?**
Check the Vite terminal output for build errors. The file watcher might be detecting changes but the build is failing.

**Slow rebuilds?**
Consider whether your API surface can be split across multiple source folders.
Each source folder builds independently, so splitting can reduce rebuild size.
