---
title: Generators - SolidJS - Preload
description: Generators - SolidJS - Preload
---

The preload pattern integrates beautifully with `KappaJS`'s generated fetch clients.
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
and use it both for preloading and for accessing the data in your component:

```tsx [pages/users/index.tsx]
import { createAsync } from "@solidjs/router";
import { GET as fetchData } from "@front/{api}/users/data/fetch";

export default function Page() {
  // createAsync recognizes that fetchData is the same function from preload
  // and reuses the fetched data instead of fetching again
  const data = createAsync(fetchData);

  return (
    <div>
      {data() && <UserList users={data().users} />}
    </div>
  );
}

// Export the fetch function as preload
export const preload = fetchData;
```

This pattern is elegant in its simplicity.

The `preload` export tells the router what function to call for prefetching.
When your component renders, `createAsync` receives the same function
and recognizes it as already-fetched data.

The router's internal caching means you're not making duplicate requests —
the data fetched during preload is the data your component receives.

The type safety flows through this entire chain.
The fetch client's GET method is typed based on your API endpoint's response type.

`createAsync` infers its type from the function you pass it.
Your component knows exactly what shape of data to expect,
all derived from your API definition.

