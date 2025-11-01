---
title: Generated OpenAPI Specification
description: Complete OpenAPI 3.1 spec with paths, schemas, parameters, request bodies, responses, and validation rules. Automatic regeneration on route changes with Swagger UI and Redoc integration.
head:
  - - meta
    - name: keywords
      content: openapi spec, api paths, json schema, request bodies, response schemas, swagger ui, redoc, api documentation tools
---

The generator produces a complete OpenAPI 3.1 specification that includes:

**Paths** - All your API routes with their HTTP methods, parameters, request bodies, and responses

**Schemas** - Type definitions extracted from your TypeScript types and validation schemas

**Parameters** - Path, query, and header parameters with their types and constraints

**Request Bodies** - Payload schemas for POST, PUT, and PATCH endpoints

**Responses** - Response schemas with status codes and content types

**Validation Rules** - Constraints from your `TRefine` types appear as JSON Schema validation keywords

### Path Variations for Optional Parameters

Routes with optional parameters generate multiple OpenAPI paths
since OpenAPI requires all path parameters to be mandatory.

For a route at `users/[id]/posts/[[postId]]/index.ts`,
the generator creates two paths:
- `/users/{id}/posts/{postId}` - Full path with optional parameter
- `/users/{id}/posts` - Path without optional parameter

Both paths reference the same handlers and schemas,
providing complete documentation while maintaining OpenAPI compliance.

### Usage During Development

The OpenAPI spec regenerates automatically when you modify API routes.

The generator runs in the background alongside other generators,
updating the spec file whenever route definitions, types, or validation schemas change.

You can serve the generated spec with documentation tools like:
- **Swagger UI** - Interactive API documentation
- **Redoc** - Clean, responsive API docs
- **Stoplight Elements** - Customizable documentation components

