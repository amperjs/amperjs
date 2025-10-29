---
title: Fetch Client - Error Handling
description: Fetch Client - Error Handling
---

When fetch requests fail, the client throws errors
that you handle through standard try-catch blocks or promise rejection handlers.

Validation errors thrown before making requests contain detailed information about what failed validation,
letting you provide meaningful feedback to users.

Network errors, server errors, and other runtime failures follow standard fetch error patterns.
You handle them the same way you'd handle any fetch-based API calls:

```ts [pages/example/index.tsx]
import fetchMap, { ValidationError } from "@front/{fetch}";
const useFetch = fetchMap["users/[id]"];

try {
  const response = await useFetch.POST([userId], payload);
  // Handle success
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation failure
    console.error("Invalid data:", error.message);
  } else {
    // Handle other errors (network, server, etc.)
    console.error("Request failed:", error);
  }
}
```

The combination of client-side validation (which catches problems before making requests)
and server-side validation (which catches problems if client-side checks are bypassed) provides defense in depth.

Users get immediate feedback for common validation issues,
while the server remains protected against invalid data.
