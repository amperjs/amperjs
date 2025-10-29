---
title: Validation - Understanding Performance
description: Validation - Understanding Performance
---

`AmperJS`'s type-to-schema conversion uses TypeScript's compiler API
to deeply analyze your types, including tracing through all referenced files
to build a complete dependency graph.

This thorough analysis is what enables the seamless experience
of writing pure TypeScript types and getting runtime validation,
with a brief generation step for each route's schema.

Generation time scales with complexity — simple routes process nearly instantly,
while routes with deep type hierarchies and extensive dependencies
may require a few seconds to fully analyze.

But this does not impact your development workflow, as generation happens
automatically in the background — it consumes computing time, not human time.

You continue performing while schemas generate, and the system intelligently
caches results to minimize regeneration on subsequent changes.

## ⚙️ How Generation Works

The generator implements several design decisions
that keep this process from impacting your development workflow.

Generation runs in a worker thread,
so your Vite development server remains responsive
regardless of what the generator is doing.

The system maintains a sophisticated cache that tracks file dependencies,
regenerating schemas only when the route file or any of its type dependencies actually change.

When you're adding and modifying routes incrementally during normal development—
which is how development actually happens — generation occurs in the background
while you're writing code in your editor.

By the time you save your file and switch to your browser to test,
the validation is ready.

## 💼 Real-World Experience

In practice, after over a year of using this system in active development,
the performance characteristics integrate naturally into the development workflow.

You create a route, generation happens while you're thinking about the implementation,
and by the time you're ready to test the endpoint, everything is prepared.

The background processing model means you're rarely consciously waiting on the generator.

## 🔄 When Performance Becomes Noticeable

The generation process becomes noticeable in specific scenarios
that are infrequent by nature.

When you delete the `lib` folder or when `AmperJS` releases an update
that increments the cache version to incorporate improvements to schema templates,
all routes need to rebuild from scratch.

For a project with many routes, this full rebuild might take long minutes.

Similarly, initial project setup when schemas are generated for the first time
takes time proportional to the number of routes you have.

These full-rebuild scenarios are similar in character
to other development tooling operations —
clearing `node_modules` and reinstalling dependencies,
rebuilding after switching branches with significant changes,
or regenerating Prisma client after schema modifications.

They're noticeable but rare enough that they don't impact
the rhythm of day-to-day development.
They happen when explicitly triggered
rather than as part of your normal edit-test cycle.

## ⚖️ Performance in Context

It's worth considering this performance characteristic in the context of the alternative.

Schema-first validation libraries like Zod or Yup have zero generation overhead
because they require you to hand-write schemas.

This eliminates generation time, but it creates an ongoing maintenance burden
of keeping schemas synchronized with your TypeScript types (if you need ones).

`AmperJS` trades a few seconds of automated generation time
for eliminating this manual maintenance work entirely.

For most development workflows, this tradeoff strongly favors automation —<br>
machine time is cheaper and more reliable than human time.

## 🚀 Future Performance Improvements

As the TypeScript ecosystem continues evolving,
particularly with developments around native TypeScript implementations
that tools like [ts-morph](https://ts-morph.com/){target="_blank" rel="noopener"}
and [tsuit](https://github.com/sleewoo/tsuit){target="_blank" rel="noopener"} might leverage,
generation performance may improve further.

The current performance characteristics already support productive development,
and future improvements would be welcomed bonuses rather than necessary fixes.

