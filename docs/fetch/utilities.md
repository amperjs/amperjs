---
title: Path Utilities
description: Build URLs with path and href utility functions that handle route parameters, query strings, and base URL configuration for navigation and external references.
head:
  - - meta
    - name: keywords
      content: url construction, path utilities, query parameters, route parameters, href builder, url builder, api urls, navigation links
---

The fetch client exports utility functions for constructing URLs that respect your route's parameter structure.

These are useful when you need to build URLs for navigation, links,
or external references without making actual fetch requests.

The `path` function constructs a relative path including your route's base URL and API URL configuration:

```ts [pages/example/index.tsx]
import useFetch from "@front/{api}/users/[id]/fetch";

// For a route with a numeric ID parameter
const url = useFetch.path([123]);
// Returns: "/api/users/123" (assuming baseurl="/" and apiurl="/api")

// Include query parameters
const urlWithQuery = useFetch.path([123], { include: "posts" });
// Returns: "/api/users/123?include=posts"
```

The `href` function constructs a complete absolute URL including the host:

```ts [pages/example/index.tsx]
// Build absolute URL with host
const fullUrl = useFetch.href("https://api.example.com", [123]);
// Returns: "https://api.example.com/api/users/123"

// With query parameters
const fullUrlWithQuery = useFetch.href(
  "https://api.example.com",
  [123],
  { include: "posts" }
);
// Returns: "https://api.example.com/api/users/123?include=posts"
```

These utilities understand your route's parameter structure and handle URL construction correctly.
For routes with multiple parameters, you pass them in order:

```ts [pages/example/index.tsx]
// For route: posts/[userId]/comments/[commentId]
const url = useFetch.path([456, 789]);
// Returns: "/api/posts/456/comments/789"
```
