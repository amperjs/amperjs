---
title: Directory vs File-Based Routing
description: Understanding why directory-based routing scales better than file-based routing for organizing large applications with clear navigation, colocalization, and visual hierarchy.
head:
  - - meta
    - name: keywords
      content: directory routing benefits, file-based routing, routing comparison, scalability, code organization, folder structure, routing patterns
---

At first glance, directory-based routing might seem more verbose compared to file-based routing systems.
You might wonder why `products/[id]/index.json/index.ts` is better than simply `products/[id]/index.json.ts`.
The answer becomes clear as your application scales.

### ⚠️ File-Based Routing Limitations

In file-based routing systems, each route is a single file:

```
products/
  [id]/
    index.json.ts    → Handles /products/:id/index.json
    index.html.ts    → Handles /products/:id/index.html
    index.xml.ts     → Handles /products/:id/index.xml
    helper.ts        → Shared utilities... but for which route?
    validator.ts     → Validation logic... but for what?
```

This looks simpler initially, but quickly becomes problematic:

- **Hard to locate:** After a few months, which file handles the JSON endpoint? Was it `index.json.ts` or `json.ts` or `data.json.ts`?
- **No organization:** Where do route-specific utilities, tests, or type definitions go?
- **Cluttered structure:** Every helper file sits alongside route files with no clear ownership
- **Ambiguous ownership:** Is `helper.ts` shared by all formats or specific to one?

### 🏆 Directory-Based Routing Benefits

With directory-based routing, each route gets its own folder:

```
products/
  [id]/
    index.json/
      index.ts       → Route handler
      validator.ts   → JSON-specific validation
      types.ts       → Type definitions
      helper.ts      → JSON endpoint utilities
      index.test.ts  → Tests for this endpoint
    index.html/
      index.ts       → Route handler
      formatter.ts   → HTML-specific formatting
      template.ts    → HTML template logic
```

The benefits become apparent at scale:

**Crystal clear navigation:** Looking for the JSON endpoint? There's an `index.json/` folder right there. The folder structure **is** the documentation.

**Natural colocalization:** Each route has its own space for related files – validators, helpers, types, tests. Everything that belongs together stays together.

**Visual hierarchy:** The tree structure makes your API surface immediately visible. You can understand the entire routing structure at a glance.

**Grep-friendly:** Searching for `index.json` instantly finds the folder. No ambiguity, no guessing about file naming conventions.

**Scales gracefully:** At 10 routes, the extra folders seem like overhead. At 100 routes, they're a lifesaver. The organizational benefits compound over time.

### ⚖️ The Trade-off

Yes, directory-based routing is slightly more verbose upfront. You create a folder even when you only have one file inside it. But this small initial cost pays enormous dividends:

- Six months later, you can navigate the codebase instantly
- New team members understand the structure immediately
- Refactoring is safer because related code is physically grouped
- The file system structure serves as living documentation

It's one of those "trust the process" patterns where the benefit isn't obvious until your application grows.
But once you've experienced trying to maintain a large file-based routing system,
you'll appreciate why directory-based routing enforces this structure from the start.

