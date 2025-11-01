---
title: Plugin Best Practices
description: Best practices for KappaJS plugins including base configuration organization, explicit environment variables, consistent formatters, and incremental generator adoption.
head:
  - - meta
    - name: keywords
      content: plugin best practices, vite config, generator setup, formatter consistency, environment security, incremental adoption
---

### 💡 Plugins Best Practices

Keep your base configuration in `vite.base.ts` focused on project-wide concerns
like build output structure, server settings, and shared plugins.

Source folder configurations should only contain
folder-specific settings like port numbers, base URLs, and generators.

Use formatters consistently across all source folders
to maintain code style uniformity in generated files.

Explicitly specify environment variables in DefinePlugin
rather than relying on prefix-based exposure.
This makes your dependencies clear and prevents security issues.

Add generators incrementally.
Start with just `apiGenerator` and `fetchGenerator`,
then add validation and framework generators as you need them.
This keeps the initial setup simple while allowing growth.

