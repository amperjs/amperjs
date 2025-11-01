---
title: Customizing Generated Files
description: Customize generated SolidJS application files including App.tsx, router.tsx, Link component, and entry point. Files are generated once and persist through updates.
head:
  - - meta
    - name: keywords
      content: solidjs customization, app customization, custom router, error boundaries, custom components, generator customization
---

The generated files — `App.tsx`, `router.tsx`, `index.tsx`, and `components/Link.tsx`—
live in your source folder, not in `lib`.

This means they're yours to customize.
You can add error boundaries to App, implement custom router configurations,
modify the Link component to add analytics tracking,
or enhance the entry point with additional setup code.

The generator creates these files once
when you first add the SolidJS generator to your configuration.
It doesn't overwrite them on subsequent runs, so your customizations persist.

The generated route configuration in `lib` updates automatically
as you add or remove pages, but the foundational application structure remains under your control.

If you need more sophisticated data loading patterns than what [useResource](/generators/solid/useResource) provides,
you can implement custom resources using SolidJS's `createResource` directly.

The generated fetch clients work with any data fetching pattern —
they're just functions that return typed promises.
You can wrap them in whatever abstraction makes sense for your application.

