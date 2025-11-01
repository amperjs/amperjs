---
title: OpenAPI Best Practices
description: Best practices for OpenAPI documentation including file placement, info descriptions, multiple server environments, semantic versioning, and periodic spec review strategies.
head:
  - - meta
    - name: keywords
      content: openapi best practices
---

### 💡 OpenAPI Best Practices

Place the `outfile` in a location that's easy to serve or commit to version control.
Many teams put it at the project root or in a `docs/` directory.

Keep your `info.description` updated with authentication requirements,
rate limiting policies, and other important API usage information.

Define multiple servers for different environments (dev, staging, production)
so users can easily switch between them in documentation tools.

Use semantic versioning for your API version.
Update it when making breaking changes to help API consumers understand compatibility.

Review the generated spec periodically to ensure it accurately represents your API.
While the generator captures most details automatically,
you might want to add manual descriptions or examples for clarity.

