---
title: About
description: About
---

### 🎯 What is KappaJS?

Simply a Vite template that brings another approach
(not entirely novel, but proven valuable) to organizing full-stack applications.

You keep all of Vite's power and ecosystem while working within a structure
designed around specific organizational principles.

`KappaJS`'s approach centers on three key ideas.

🔹 First, it recognizes that applications often comprise multiple distinct areas —
perhaps a public website, an admin dashboard, a mobile API —
and treats these as independent source folders, each with its own configuration and purpose, all within a single Vite project.

🔹 Second, it organizes each source folder into separate `api/` and `pages/` directories,
creating a clear boundary between server-side logic and client-side presentation within the same cohesive module.

🔹 Third, it establishes a single source of truth for your data structures.
Write TypeScript types once, and `KappaJS` generates runtime validation, typed fetch clients, and OpenAPI schemas automatically —
keeping compile-time type checking, runtime validation, and API documentation perfectly aligned.

### 💡 KappaJS is not a framework

It's rather a **structured Vite template** offering a specific organizational pattern
that some teams and projects may find valuable,
particularly as applications grow and multiple concerns need to coexist cleanly.

---

**Start building with better structure:**
Run `npx @kappajs/create` and experience how much clearer full-stack development becomes
when separation of concerns is the default, not something you have to enforce yourself.

<div class="text-center">
  <LinkButton href="./start">Get Started</LinkButton>
</div>
