---
title: Routing - Dynamic Route Parameters
description: Routing - Dynamic Route Parameters
---

Real applications need to handle dynamic segments in URLs — user IDs, post slugs, category names, and so on.

`KappaJS` supports three types of dynamic parameters using a syntax inspired by
[`SolidStart`](https://start.solidjs.com/){target="_blank" rel="noopener"}.

The key benefit is that these patterns work identically for both API routes and client pages,
so you only need to learn the syntax once.

## [ Required Parameters ]

Required parameters use single square brackets around the parameter name, like `[id]`.

A folder named `[id]` matches exactly one path segment in that position,
and the matched value is made available to your route handler or component.

```
users/
  [id]/
    index.ts         → matches /users/123, /users/abc, /users/anything
```

This route matches `/users/123` or `/users/abc` but does not match `/users`
(missing the required segment) or `/users/123/posts`
(has an extra segment that isn't accounted for in the route structure).

The parameter name inside the brackets is significant. If you name it `[id]`,
your route handler will receive that segment as a parameter called `id`.

If you name it `[userId]`, it becomes `userId`. Choose names that make your code self-documenting.

## [[ Optional Parameters ]]

Optional parameters use double square brackets like `[[id]]`.

These routes match whether or not that segment is present in the URL,
giving you flexibility to handle both cases in a single route handler.

```
users/
  [[id]]/
    index.ts         → matches both /users and /users/123
```

This is useful when you want a route that can show either a list view (when no ID is provided)
or a detail view (when an ID is present).

Rather than creating two separate routes, you handle both cases in one place
and branch your logic based on whether the parameter exists.

**Important constraint:** Optional parameters must appear at the end of your route path.
You cannot have static segments or required parameters after optional parameters.

Valid patterns:
- `users/[id]/posts/[[postId]]` ✅
- `users/[id]/[[section]]/[[subsection]]` ✅

Invalid patterns:
- `users/[[id]]/posts` ❌ (static segment after optional)
- `users/[[optional]]/[required]` ❌ (required after optional)

This constraint ensures the path variations make logical sense
and prevents ambiguous routing scenarios.

## [ ...Rest Parameters ]

Rest parameters use the spread syntax `[...path]` and match any number of additional path segments.

This is particularly useful for documentation sites,
file browsers, or any situation where you need to handle arbitrarily nested paths.

```
docs/
  [...path]/
    index.ts         → matches /docs/getting-started
                     → matches /docs/api/reference
                     → matches /docs/guides/deployment/production
```

The matched segments are provided to your handler as an array,
allowing you to process the full path structure however you need.

For example, in a documentation site, you might use this to look up content files based on the full path,
or in a file browser, you might navigate a directory structure.

**Important**: Rest parameters must be the final segment in a route path.<br/>
A pattern like `some/path/[...rest]/more` would be ambiguous and is not supported,
as the router wouldn't know where the rest parameter ends and the fixed segment begins.

## ⚠️ Constraints

In directory-based routing, folder names become URL path segments,
and each folder name must be entirely static or entirely dynamic –
you cannot mix static text and parameter syntax within a single folder name.

### What Doesn't Work

```
api/
  products/
    book-[id]/       ❌ Cannot mix "book-" prefix with [id] parameter
      index.ts       → Would try to match /api/products/book-[id] literally

  results.[ext]/     ❌ Cannot mix "results." with [ext] parameter
    index.ts         → Would try to match /api/results.[ext] literally

pages/
  shop/
    [category]-sale/ ❌ Cannot mix [category] with "-sale" suffix
      index.ts       → Would try to match /shop/[category]-sale literally
```

These patterns don't work because the routing system treats each folder name as a complete unit –
either a fixed string that matches exactly, or a parameter that captures the entire segment, never both.

### What Works Instead

Use separate folders to create the routing patterns you need:

```
api/
  products/
    [bookId]/        ✅ Entire folder name is the dynamic parameter
      index.ts       → Matches /api/products/123, /api/products/abc

  results/
    [ext]/           ✅ Separate folders for static and dynamic parts
      index.ts       → Matches /api/results/json, /api/results/xml

pages/
  shop/
    [category]/
      sale/          ✅ Static folder follows dynamic folder
        index.ts     → Matches /shop/electronics/sale, /shop/books/sale
```

This structure maintains the clean mapping between folders and URL paths that makes directory-based routing predictable.

### Static Extensions in Folder Names

While folder names cannot mix static text and parameters,
they can include static file extensions as part of their complete static name:

```
pages/
  data.html/
    index.ts         ✅ Static folder name with extension
                     → Matches /data.html

  results.json/
    index.ts         ✅ Another static folder with extension
                     → Matches /results.json

  [filename].html/
    index.ts         ❌ Cannot mix parameter with extension
```

This works because `data.html` is treated as a complete static folder name,
just like any other static text. The `.html` is not a dynamic part –
it's simply characters in the folder name that will match that exact URL path.

### Better approach for dynamic routes with extensions

Rather than attempting patterns like `/products/[id].json`, use the `index.json` static section instead:

```
api/
  products/
    [id]/
      index.json/    ✅ Static folder with extension
        index.ts     → Serves /api/products/123/index.json
                     → Works seamlessly with HTTP servers (nginx, etc.)
```

The `index.*` naming convention for folders is universally understood by web servers.
This pattern provides a clean, predictable way to serve routes with file extensions
while maintaining the constraint that each folder name must be entirely static or entirely dynamic.


### Workaround for Mixed Patterns

If your application needs to match URL patterns like `/products/book-123`,
create a dynamic folder that captures the entire segment and validate the format in your route handler:

```ts [index.ts]
// File structure:
// api/
//   products/
//     [productId]/
//       index.ts

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
      const { productId } = params;

      // Validate and parse the expected format
      const match = productId.match(/^book-(\d+)$/);
      ctx.assert(match?.[1], 404, "Not Found")

      const bookId = match[1]; // Extract the numeric ID
      // Use bookId to fetch and return data...
  }),
]);
```

This approach keeps the folder structure simple and predictable while giving you full control over validation in your handler code.
The `[productId]` folder captures anything in that position, and your handler decides whether it's valid.

