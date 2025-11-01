---
title: Customizing Generated Files
description: Customize generated React application files including App.tsx, router.tsx, Link component, and entry point. Files are generated once and persist through updates.
head:
  - - meta
    - name: keywords
      content: react customization, app customization, custom router, error boundaries, custom components, generator customization
---

The core generated files — including `App.tsx`, `router.tsx`, `index.tsx`, and `components/Link.tsx` —
reside directly within your source directory rather than the `lib` folder.

This placement gives you full ownership to customize them as needed.
You might integrate error boundaries into App, create specialized router setups,
enhance the Link component with analytics capabilities,
or extend the entry point with additional initialization logic.

These foundational files are generated only once during initial React generator setup.
Since the generator preserves them across subsequent executions, your modifications remain intact indefinitely.

While the route configurations in `lib` dynamically update as you modify your page structure,
the core application architecture stays firmly under your direction.

The generated API clients maintain compatibility with any data fetching approach —
they're essentially promise-returning functions with built-in type safety.
You're free to incorporate them into whatever abstraction layer best suits your application's architecture.

