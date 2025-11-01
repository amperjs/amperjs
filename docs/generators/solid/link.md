---
title: Type-Safe Link Component
description: Type-safe navigation with generated Link component that wraps SolidJS Router's A component. Autocomplete for routes, compile-time parameter validation, and query string handling.
head:
  - - meta
    - name: keywords
      content: solidjs link, type-safe navigation, route parameters, LinkProps, typed routing, query parameters, solidjs router navigation
---

The generator creates a `Link` component that wraps SolidJS Router's `A` component
with type safety for route navigation.

This component knows about all your routes and their parameters,
providing autocomplete and type checking for navigation.

The component is available at `components/Link.tsx` in your source folder:

```tsx [components/Link.tsx]
import { A, type AnchorProps, useLocation } from "@solidjs/router";
import { type JSXElement, splitProps } from "solid-js";

import { stringify, unwrap } from "@front/{fetch}/lib";
import pageMap from "@front/{pages}";
import type { LinkProps } from "@front/{solid}/router";
import { baseurl } from "@front/config";

export default function Link(
  props: AnchorProps & {
    to?: LinkProps;
    query?: Record<string | number, unknown>;
    children: JSXElement;
  },
) {
  const [knownProps, restProps] = splitProps(props, [
    "to",
    "query",
    "children",
  ]);

  const href = () => {
    if (knownProps.to) {
      const [key, ...params] = knownProps.to;
      return pageMap[key]?.base(params as never, knownProps.query);
    }
    const path = useLocation().pathname.replace(
      new RegExp(`^${baseurl.replace(/\/+$/, "")}/`),
      "/",
    );
    return knownProps.query
      ? [path, stringify(unwrap(knownProps.query))].join("?")
      : path;
  };

  return <A {...{ ...restProps, href: href() }}>{knownProps.children}</A>;
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

This type structure provides several benefits.

TypeScript autocomplete suggests available routes as you type the first element of the array.
When you select a route with parameters,
TypeScript enforces that you provide those parameters as additional array elements.

If you rename a route directory,
TypeScript errors appear at every Link that references the old name,
helping you find and fix all references.

The optional `query` prop accepts an object that becomes the URL's query string.
The Link component handles serialization,
including unwrapping reactive stores if you pass reactive data.

If you omit the `to` prop, Link uses the current location,
which is useful for adding query parameters to the current route without navigation:

```tsx
// Add a query parameter to current route
<Link query={{ filter: "active" }}>
  Filter Active Items
</Link>
```

The Link component accepts all props that SolidJS Router's `A` component accepts,
excluding `to` which is replaced with the typed version.

This means you can use `activeClass`, `end`,
and other router-specific props alongside your type-safe navigation.

