---
title: Routing Best Practices
description: Best practices for organizing routes including grouping related endpoints, colocalizing utilities, handling optional parameters, and maintaining stable URL structures.
head:
  - - meta
    - name: keywords
      content: route organization, best practices, folder structure, url stability, route colocalization, api contracts, seo friendly urls
---

### 💡 Route Organization Best Practices

As your application grows, consider these patterns for keeping your routes organized and maintainable.

Group related routes in folders even when they don't share a common URL prefix.

For example, you might have an `api/auth/` folder containing `login`, `logout`, and `register` routes.
This keeps authentication-related code together even though the routes might be at different URL levels.

Keep route-specific utilities in the same folder as the route.
If your `api/users/[id]/index.ts` needs helper functions, create `api/users/[id]/utils.ts` in the same directory.
This colocalization makes it easy to find related code and understand the full scope of what a route does.

For complex routes that need multiple files (types, validators, utilities),
the folder structure naturally accommodates them.
Your route folder becomes a mini-module containing everything related to that endpoint or page.

Consider using optional parameters thoughtfully.
While they're convenient for handling both list and detail views in one route,
this can lead to complex conditional logic.
Sometimes two separate routes with clearer purposes are easier to maintain than one route with branching behavior.

Remember that route structure affects URLs, which affects user bookmarks and search engine indexing for client pages,
and API contracts for API routes.

Plan your structure with some consideration for stability —
reorganizing routes later means changing URLs, which can break external references.

