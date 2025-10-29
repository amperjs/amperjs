---
title: Generators - React - Best Practices
description: Generators - React - Best Practices
---

### 💡 React Best Practices

For optimal React development with `AmperJS`, these established patterns will streamline your workflow.

Implement loader functions for routes requiring predictable data during navigation.
When specific information is essential regardless of user behavior,
preloading delivers superior UX by providing data before component rendering begins,
removing the need for loading indicators.

When dealing with information triggered by post-load user interactions,
employ React Query's `useQuery` hook within your components.
This approach provides precise control over fetch timing and enables custom handling of loading progress and error scenarios.

Maintain your App component's focus on application-level responsibilities.
Incorporate global error handling, authentication contexts, and theming systems here,
while reserving route-specific functionality for individual route components.

Capitalize on the Link component's integrated type validation.
The compile-time verification of route identifiers and their parameters blocks defective links from reaching production environments.
During route restructuring, rely on TypeScript to identify all locations requiring synchronization.

Note that the routing configurations within `lib` are automatically generated from your page components.
Avoid manual edits to these files, as they refresh dynamically with page modifications.
Implement changes through the source `pages` directory to trigger automatic route configuration updates.

Deploy React's Suspense boundaries with strategic intent.
The baseline App component incorporates a single Suspense wrapper for the complete application interface.

To achieve finer-grained loading management,
introduce supplementary Suspense boundaries inside route components to isolate specific interface segments.

Access route-level information through the `useLoaderData` hook,
which guarantees consistency with preloaded content while maintaining accurate TypeScript type inference.

```tsx
import { useLoaderData } from "react-router";

export default function UserProfile() {
  const user = useLoaderData(); // Typed based on your loader
  return <div>{user.name}</div>;
}
```

For complex state management, combine React's built-in state hooks with Context
or use state management libraries like Zustand or Redux Toolkit when appropriate.

Remember that all route components are lazy-loaded by default.
Structure your components to handle the asynchronous loading gracefully,
using Suspense fallbacks for optimal user experience.

