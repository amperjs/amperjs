---
title: Fetch Client - Integration
description: Fetch Client - Integration
---

The generated fetch client integrates naturally with modern frontend patterns.
You can wrap it in custom hooks, use it directly in event handlers,
or incorporate it into state management solutions.

For SolidJS, you might use it with `createResource`:

```ts [pages/example/index.tsx]
import { createResource } from "solid-js";
import useFetch from "@front/{api}/users/[id]/fetch";

function UserProfile(props) {
  const [user] = createResource(
    () => props.userId,
    (id) => useFetch.GET([id])
  );

  return (
    <div>
      {user.loading && <div>Loading...</div>}
      {user() && <div>{user().name}</div>}
    </div>
  );
}
```

For React applications, you might create custom hooks that wrap the fetch client:

```ts [pages/example/index.tsx]
import { useState, useEffect } from "react";
import useFetch from "@front/{api}/users/[id]/fetch";

function useUser(userId: number) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    useFetch.GET([userId])
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
```

The fetch client returns standard promises, so it works with any async pattern your framework supports.

The type safety flows through these abstractions — your custom hooks and components know exactly
what shape of data to expect based on your API definitions.

