---
title: Generators - React - Routing
description: Generators - React - Routing
---

The React generator continuously watches your `pages` directory for components.

When you create a page component, the generator analyzes its location
and creates a corresponding route configuration.

These route configurations are written to your `lib` directory
and imported by your router.

For a component at `pages/users/[id]/index.tsx`,
the generator creates a route configuration like this:

```ts
  {
    path: "users/:id",
    Component: lazy(() => import("@admin/pages/users/[id]")),
    loader: async ({ params }) => {
      const module = await import("@admin/pages/users/[id]") as ComponentModule;
      if (module.loader) {
        return module.loader({ params });
      }
      return null;
    },
  }
```

Notice several important characteristics of this generated route.

The generator automatically adapts file system parameters to React Router's expected format,
transforming bracket notation like `[id]` into colon-prefixed segments (`:id`).

Components are implemented with lazy loading, ensuring they're excluded from the initial JavaScript bundle.
Each route's code is fetched only when needed—when a user navigates to that specific path.

This lazy-loading strategy is applied universally across all routes.
The benefit is a significantly reduced initial payload, leading to faster application startup.
Visitors download code selectively, based on their navigation patterns.

Although eager loading could be valuable for high-priority routes,
implementing it would necessitate complex AST analysis to identify special markers.

Each route definition also incorporates a loader function.
When a page component exports a `loader`, the router executes it during key moments: initial page load,
user hover over relevant links, or actual navigation events.

This proactive data fetching enhances the user experience by retrieving necessary information before the component renders,
making the application feel more responsive.

