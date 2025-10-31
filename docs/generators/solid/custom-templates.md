---
title: Generators - SolidJS - Custom Templates
description: Generators - SolidJS - Custom Templates
---

The `SolidJS` generator allows you to override the default page template
for specific routes using pattern matching.

This is useful for creating specialized templates
for landing pages, marketing pages, or any route that needs custom structure.

## ⚙️ Configuration

Pass custom templates through the generator options in your `vite.config.ts`:

```ts [vite.config.ts]
import solidPlugin from "vite-plugin-solid";
import devPlugin from "@kappajs/dev";
import solidGenerator from "@kappajs/solid-generator";
import defineConfig from "../vite.base";

const landingTemplate = `
export default function Page() {
  return (
    <div class="landing-page">
      <h1>Welcome to Our Landing Page</h1>
      <p>This uses a custom template!</p>
    </div>
  );
}
`;

export default defineConfig(import.meta.dirname, {
  // ...
  plugins: [
    solidPlugin(),
    devPlugin(apiurl, {
      generators: [
        solidGenerator({
          templates: {
            "landing/*": landingTemplate,
            "marketing/**/*": landingTemplate,
          },
        }),
        // other generators ...
      ],
    }),
  ],
});
```

## 🎯 Pattern Matching

Templates use glob-style patterns to match routes:

### Single Level Match (`*`)

Matches routes at a specific depth:

```ts
{
  "landing/*": template,
}
```

**Matches:**
- `landing/home`
- `landing/about`
- `landing/[slug]`

**Does not match:**
- `landing/features/new` (too deep)
- `landing` (not deep enough)

### Multi-Level Match (`**`)

Matches routes at any depth:

```ts
{
  "marketing/**/*": template,
}
```

**Matches:**
- `marketing/campaigns/summer`
- `marketing/promo/2024/special`
- `marketing/[id]/details`

### Exact Match

Match a specific route:

```ts
{
  "products/list": template,
}
```

**Matches:**
- Only `products/list`

## 📊 Pattern Priority

When multiple patterns match a route,
the first matching pattern in the configuration object is used:

```ts
solidGenerator({
  templates: {
    "landing/home": homeTemplate,      // Most specific
    "landing/*": landingTemplate,      // Less specific
    "**/*": fallbackTemplate,          // Least specific
  },
})
```

For the route `landing/home`:
- Uses `homeTemplate` (exact match takes priority)

## 🔀 Dynamic Routes

Custom templates work with all parameter types:

```ts
{
  // Required parameter
  "users/[id]": userTemplate,

  // Optional parameter
  "products/[[category]]": productTemplate,

  // Rest parameter
  "docs/[...path]": docsTemplate,

  // Combined
  "shop/[category]/[[subcategory]]": shopTemplate,
}
```

The template receives the same props as default templates,
including route parameters.

## 📝 Template Structure

Custom templates are standard `SolidJS` component strings:

```ts
const customTemplate = `
import { useParams } from "@solidjs/router";

export default function Page() {
  const params = useParams();

  return (
    <div>
      <h1>Custom Template</h1>
      <p>Route params: {JSON.stringify(params)}</p>
    </div>
  );
}
`;
```

Templates have access to:
- `SolidJS` Router hooks (`useParams`, `useNavigate`, etc.)
- All imports from your source folder
- Route parameters through `useParams()`

## ✨ Use Cases

### Landing Pages

Create specialized landing pages with custom layouts:

```ts
const landingTemplate = `
import LandingLayout from "@/layouts/Landing";

export default function Page() {
  return (
    <LandingLayout>
      <div class="hero">
        <h1>Welcome</h1>
        <button>Get Started</button>
      </div>
    </LandingLayout>
  );
}
`;

solidGenerator({
  templates: {
    "landing/**/*": landingTemplate,
  },
})
```

### Marketing Pages

Use different templates for marketing content:

```ts
solidGenerator({
  templates: {
    "marketing/**/*": marketingTemplate,
    "promo/**/*": promoTemplate,
  },
})
```

### Admin Pages

Apply consistent structure to admin routes:

```ts
solidGenerator({
  templates: {
    "admin/**/*": adminTemplate,
  },
})
```

## 📄 Default Template

Routes that don't match any custom pattern use the default generator template,
which displays the route name and is meant to be replaced with your actual implementation.

If you want a custom default for all routes:

```ts
solidGenerator({
  templates: {
    "**/*": myDefaultTemplate,
  },
})
```

This overrides the generator's default template for all routes.

## 💡 Best Practices

**Keep templates focused**<br>
Use custom templates for routes that need specific structure,
not for minor variations.

**Use layouts**<br>
Instead of duplicating structure across templates,
import shared layouts within templates.

**Consider maintenance**<br>
Remember that templates are strings in your config file.
For complex templates, consider generating them from separate files.

**Test thoroughly**<br>
Custom templates bypass the default generator behavior,
so ensure they work with your routing and parameter handling.

