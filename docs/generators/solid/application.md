---
title: Generators - SolidJS - Application
description: Generators - SolidJS - Application
---

To establish a robust foundation, Solid generator produces a suite of core files.

This infrastructure handles critical tasks like mapping your file structure to application routes,
enabling type-safe navigation, and ensuring efficient code-splitting through lazy loading.

## 🎨 The App Component

The generator creates `App.tsx` as your root application component.
This component wraps your entire application and provides SolidJS's Suspense boundary:

```tsx [App.tsx]
import { type ParentComponent, Suspense } from "solid-js";

const App: ParentComponent = (props) => {
  return <Suspense>{props.children}</Suspense>;
};

export default App;
```

This simple component serves as your application shell.
The Suspense boundary allows child components to suspend during async operations
like data fetching, showing fallback content until resources are ready.

You can customize this component to add global layouts, error boundaries,
or other application-wide concerns.

## 🛣️ The Router Configuration

The `router.tsx` file connects `KappaJS`'s generated routes to SolidJS Router:

```tsx [router.tsx]
import { Router } from "@solidjs/router";

import { routes } from "@front/{solid}/router";

import App from "./App";
import { baseurl } from "./config";

export default function AppRouter() {
  return (
    <Router root={App} base={baseurl}>
      {routes}
    </Router>
  );
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
import { render } from "solid-js/web";

import Router from "./router";

const root = document.getElementById("app");

if (root) {
  render(Router, root);
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

