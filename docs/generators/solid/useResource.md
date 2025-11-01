---
title: useResource Helper
description: Generated useResource helper that wraps SolidJS createResource with type safety, automatic refetching on navigation, and integration with SolidJS Router query function.
head:
  - - meta
    - name: keywords
      content: solidjs resource, createResource, useResource, data fetching, reactive data, solidjs query, resource refetch, type-safe resource
---

For common data fetching patterns,
the generator provides a `useResource` helper that wraps SolidJS's `createResource`
with type safety and smart refetching behavior.

This helper is generated in your `lib` directory and easily imported:

```ts
import { useResource } from "@front/{solid}";
```

The implementation combines SolidJS Router's query function with createResource,
creating a resource that refetches when appropriate:

```ts [lib/@front/{solid}/index.ts]
import { query, useLocation } from "@solidjs/router";
import { createResource } from "solid-js";

import fetch from "@front/{fetch}";

type ResourceMap = {
  "users/data": import("@front/{api}/users/data/fetch").ResponseT extends {
    GET: unknown;
  }
    ? import("@front/{api}/users/data/fetch").ResponseT["GET"]
    : unknown;
};

export const useResource = <K extends keyof ResourceMap>(routeName: K) => {
  const location = useLocation();
  const fetchData = () => fetch[routeName].GET();
  const queryData = query(fetchData, routeName);
  return createResource<ResourceMap[K]>(
    () => location.pathname as never,
    queryData as never,
  );
};
```

The `ResourceMap` type is generated based on your API routes
that have GET handlers with response types.
This provides autocomplete for available routes and types the returned data correctly.

Using `useResource` in a component is straightforward:

```tsx [pages/users/index.tsx]
import { useResource } from "@front/{solid}";

export default function Page() {
  const [data, { mutate, refetch }] = useResource("users/data");

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {data() && <pre>{JSON.stringify(data(), null, 2)}</pre>}
    </div>
  );
}
```

The helper returns a standard SolidJS resource tuple.
The first element is the reactive data accessor.
The second element provides `mutate` for optimistically updating the data
and `refetch` for manually triggering a refresh.

The resource refetches automatically when `location.pathname` changes.
This means navigating between routes, or changing route parameters within the same route,
triggers refetching.

This behavior works well for routes where data depends on URL parameters.
If your data doesn't depend on the route,
or if you need more control over when refetching occurs,
you might implement a custom resource instead.

The current implementation is intentionally straightforward.
Future versions might accept options as a second argument for more configurability,
such as disabling automatic refetching or providing custom refetch triggers.

For now, the helper covers the common case of route-dependent data
that should refresh on navigation.

