---
title: Generators - SolidJS - Utilities
description: Generators - SolidJS - Utilities
---

`AmperJS`'s fetch clients need to work with framework-specific data structures,
particularly reactive stores that wrap plain data.

To handle this, `AmperJS` provides an unwrap placeholder
that framework generators override with their own implementations.

The default unwrap implementation is a no-op that simply returns data unchanged.

When you add a framework generator like the SolidJS generator,
it overwrites this placeholder with framework-specific logic.

This architecture allows fetch clients to call unwrap internally
without knowing which framework you're using.

For SolidJS, the generator provides an implementation that handles SolidJS stores:

```ts [lib/@front/{fetch}/unwrap.ts]
export type MaybeWrapped<T> = import("solid-js/store").Store<T> | T;
export { unwrap } from "solid-js/store";
```

The `MaybeWrapped` type indicates that data might be a store or a plain value.
The `unwrap` function extracts the plain value regardless.

This allows you to pass reactive data to fetch clients safely:

```tsx [pages/users/index.tsx]
import { createStore } from "solid-js/store";
import useFetch from "@front/{api}/users/fetch";

export default function Page() {
  const [formData, setFormData] = createStore({
    name: "",
    email: "",
  });

  const handleSubmit = async () => {
    // unwrap is called internally by the fetch client
    await useFetch.POST([], formData);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

The `stringify` utility handles query parameter serialization
consistently with your API's expectations.

Different generators might implement these utilities differently
based on their framework's patterns, but they all serve the same purpose
of adapting framework-specific data structures to the fetch client's requirements.
