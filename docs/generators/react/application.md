---
title: Generators - React - Application
description: Generators - React - Application
---

React generator automates the project setup by creating the foundational files needed for routing and application structure.

This includes the router configuration, type-safe navigation components,
and lazy-loaded route definitions, providing a ready-to-use infrastructure.

## 🎨 The App Component

The generator creates `App.tsx` as your root application component.
This component wraps your entire application and provides React's Suspense boundary:

```tsx [App.tsx]
import { Suspense, type ReactNode } from "react";

export default function App({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
```

This simple component serves as your application shell.
The Suspense boundary allows child components to suspend during async operations
like data fetching, showing fallback content until resources are ready.

You can customize this component to add global layouts, error boundaries,
or other application-wide concerns.

## 🛣️ The Router Configuration

The `router.tsx` file connects `KappaJS`'s generated routes to React Router:

```tsx [router.tsx]
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

import { routes } from "@admin/{react}/router";

import App from "./App";
import { baseurl } from "./config";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <App>
          <Outlet />
        </App>
      ),
      HydrateFallback: () => <div>Loading...</div>,
      children: routes,
    },
  ],
  {
    basename: baseurl,
  },
);

export default function Router() {
  return <RouterProvider router={router} />;
}
```

This configuration uses your source folder's `baseurl` from the config file,
ensuring that routes are served from the correct path.

The `routes` import comes from generated code in your `lib` directory,
which we'll explore next.

The Router uses your App component as the root,
meaning every route renders within the App's Suspense boundary.

## 🎯 The Entry Point

The `index.tsx` file serves as your application's entry point,
rendering your router into the DOM:

```tsx [index.tsx]
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Router from "./router";

const root = document.getElementById("app");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <Router />
    </StrictMode>
  );
} else {
  console.error("Root element not found!");
}
```

This file is referenced from your `index.html` file,
which `KappaJS` creates when you initialize a source folder:

```html
<script type="module" src="/index.tsx"></script>
```

The `index.html` file serves as Vite's entry point.
When Vite processes your application, it starts from this HTML file,
follows the script import to `index.tsx`, and builds your entire application graph from there.

