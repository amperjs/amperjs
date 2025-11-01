---
title: Type-Safe Link Component
description: Type-safe navigation with generated Link component that wraps React Router's Link. Autocomplete for routes, compile-time parameter validation, and query string handling.
head:
  - - meta
    - name: keywords
      content: react link, type-safe navigation, route parameters, LinkProps, typed routing, query parameters, react router navigation
---

The generator creates a `Link` component that wraps React Router's `Link` component
with type safety for route navigation.

This component knows about all your routes and their parameters,
providing autocomplete and type checking for navigation.

The component is available at `components/Link.tsx` in your source folder:

```tsx [components/Link.tsx]
import { Link as RouterLink, type LinkProps as RouterLinkProps, useLocation } from "react-router";
import type { ReactNode } from "react";

import { stringify } from "@admin/{fetch}/lib";
import pageMap from "@admin/{pages}";
import type { LinkProps } from "@admin/{react}/router";
import { baseurl } from "@admin/config";

export default function Link(
  props: Omit<RouterLinkProps, "to"> & {
    to?: LinkProps;
    query?: Record<string | number, unknown>;
    children: ReactNode;
  },
) {
  const { to, query, children, ...restProps } = props;
  const location = useLocation();

  const href = (() => {
    if (to) {
      const [key, ...params] = to;
      return pageMap[key]?.base(params as never, query);
    }
    const path = location.pathname.replace(
      new RegExp(`^${baseurl.replace(/\/+$/, "")}/`),
      "/",
    );
    return query ? [path, stringify(query)].join("?") : path;
  })();

  return (
    <RouterLink {...restProps} to={href}>
      {children}
    </RouterLink>
  );
}
```

Using Link in your components provides type-safe navigation:

```tsx [components/menu.tsx]
import Link from "@front/components/Link";

export default function Menu() {
  return (
    <nav>
      <Link to={["index"]}>
        <IconHome />
        Home
      </Link>

      <Link to={["users/[id]", 123]}>
        User Profile
      </Link>

      <Link to={["posts/[slug]", "hello-world"]} query={{ ref: "sidebar" }}>
        Blog Post
      </Link>
    </nav>
  );
}
```

The `to` prop is typed as `LinkProps`,
which is a union type generated based on your routes:

```ts
export type LinkProps =
  | ["index"]
  | ["users/[id]", id: string | number]
  | ["posts/[slug]", slug: string]
  // ... other routes
```

This typing approach delivers multiple advantages during development.

As you begin typing the initial array element, TypeScript's IntelliSense immediately presents compatible route options.
For parameterized routes, the type system mandates including the necessary parameters as subsequent array items.

Route directory renames trigger immediate TypeScript feedback,
surfacing errors at every navigation link using the outdated reference.
This provides comprehensive guidance for updating all affected locations.

The optional `query` property takes a standard object and automatically converts it into a properly formatted query string,
with the Link component managing all necessary URL encoding internally.

When the `to` property is omitted, the Link component defaults to the current page location.
This behavior enables convenient query parameter modifications without triggering actual navigation.

```tsx
// Add a query parameter to current route
<Link query={{ filter: "active" }}>
  Filter Active Items
</Link>
```

The Link component enhances React Router's `Link` component with type safety
while accepting all the same props. The `to` prop is replaced with a typed version
that provides autocomplete and parameter validation.

This means you can use props like `replace`, `state`,
and other router-specific props alongside your type-safe navigation.

