---
title: Vite Plugins - Intro
description: Vite Plugins - Intro
---

`KappaJS` is a standard Vite template.
All its functionality comes from three Vite plugins that handle path resolution,
environment variable management, and code generation.

Using these plugins is straightforward — import them and add them to your Vite configuration.

### 🔌 The Three Plugins

`KappaJS` provides three plugins that work together to create the development experience:

🔹 **AliasPlugin** reads the path mappings from your `tsconfig.json`,
performs filesystem analysis, and provides alias information to Vite.
This allows Vite to resolve imports like `@front/{api}` and `@front/{fetch}`
to the correct locations in your source and `lib` directories.
([Details](/plugins/alias-plugin))

🔹 **DefinePlugin** manages environment variables with fine-grained control.
Unlike Vite's default environment handling,
this plugin lets you explicitly specify which variables to expose to client code,
both from `process.env` and from `.env` files.
([Details](/plugins/define-plugin))

🔹 **DevPlugin** is the main plugin that coordinates code generation.
It manages generators (for API routes, fetch clients, validation schemas, etc.)
and formatters (for ensuring generated code matches your project's style conventions).
([Details](/plugins/dev-plugin))

### 🎨 Customizing Plugin Behavior

Each plugin is designed to work with sensible defaults,
but you can customize them for your project's specific needs.

For AliasPlugin, customization typically isn't needed
since it derives everything from your `tsconfig.json`.
If you need custom behavior, you can modify the `tsconfig.json` path mappings
and the plugin will adapt.
([Details](/plugins/alias-plugin))

For DefinePlugin, adjust which environment variables to expose
by modifying the `keys` arrays in your base configuration.
([Details](/plugins/define-plugin))

For DevPlugin, add or remove generators and formatters
in each source folder's configuration.
Different source folders can use different generators —
perhaps your main app uses SolidJS while your admin panel uses React.
([Details](/plugins/dev-plugin))

