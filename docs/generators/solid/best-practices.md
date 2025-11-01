---
title: SolidJS Best Practices
description: Best practices for building SolidJS applications with KappaJS including preload patterns, resource management, type-safe navigation, and Suspense boundary strategies.
head:
  - - meta
    - name: keywords
      content: solidjs best practices, preload pattern, createResource, suspense boundaries, type-safe routing, data fetching patterns, solidjs development
---

### 💡 SolidJS Best Practices

When building SolidJS applications with `KappaJS`,
consider these patterns for effective development.

Use the preload pattern for routes where data is known at navigation time.
If a route always needs the same data regardless of user actions,
preloading provides the best user experience.
The data arrives before the component renders, eliminating loading spinners.

For data that depends on user interactions after the page loads,
use `createResource` or [useResource](/generators/solid/useResource) directly in your components.
This gives you control over when fetching occurs
and how to handle loading and error states.

Keep your App component focused on application-wide concerns.
Add global error boundaries, authentication context providers,
or theme providers here.
Route-specific logic belongs in route components.

Leverage the Link component's type safety.
The compile-time checking of route names and parameters
prevents broken links from reaching production.
When refactoring routes,
let TypeScript guide you to all the places that need updates.

Remember that the generated route configuration in `lib`
is derived from your page components.
Don't edit these files directly — they regenerate whenever your pages change.
Make your changes in the source `pages` directory,
and the generator updates the route configuration automatically.

Use SolidJS's Suspense boundaries strategically.
The default App component includes one Suspense boundary for the entire application.

For more granular control over loading states,
add additional Suspense boundaries within your route components
around specific parts of the UI.

