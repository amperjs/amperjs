---
title: Loader Pattern
description: Integrate data fetching with React Router loaders. Export loader functions that work with useLoaderData for efficient data fetching before component rendering.
head:
  - - meta
    - name: keywords
      content: react loader, data fetching, useLoaderData, route data, react router data, preloading, loader function, async data
---

The loader pattern integrates beautifully with React Router's data fetching.
You define what data a route needs,
and the router ensures that data is ready when the component renders.

First, create an API endpoint that provides the data.
Suppose you have `api/users/data/index.ts`:

```ts [api/users/data/index.ts]
import { defineRoute } from "@front/{api}/users/data";

export default defineRoute(({ GET }) => [
  GET<never, Data>(async (ctx) => {
    // Fetch data from database or external API
    ctx.body = await fetchUserData();
  }),
]);
```

In your page component, import the fetch client's GET method
and use it both for loading and for accessing the data in your component:

```tsx [pages/users/index.tsx]
import { useLoaderData } from "react-router-dom";
import { GET as fetchData } from "@front/{api}/users/data/fetch";

export default function Page() {
  // useLoaderData recognizes that fetchData is the same function from loader
  // and reuses the fetched data instead of fetching again
  const data = useLoaderData();

  return (
    <div>
      {data && <UserList users={data.users} />}
    </div>
  );
}

// Export the fetch function as loader
export const loader = fetchData;
```

This pattern is elegant in its simplicity.

By exporting a `loader` function, you instruct the router which data-fetching logic to execute in advance.
During component rendering, the `useLoaderData` hook identifies this same function
and seamlessly accesses the pre-retrieved information.

An integrated caching layer within the router prevents redundant API calls,
ensuring your component works with the exact dataset obtained during the initial loading phase.

This pattern maintains full type consistency throughout the data pipeline.
The GET method from your fetch client inherits its typing directly from the API endpoint's response structure.

The `useLoaderData` hook automatically derives its return type from the loader function's signature.
Consequently, your component gains precise knowledge of the expected data format,
with all types originating from your API specification.

