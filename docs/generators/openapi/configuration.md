---
title: Generators - OpenAPI - Configuration
description: Generators - OpenAPI - Configuration
---

OpenAPI generator accepts the following configuration options:

### Required Options

**outfile** - Path where the OpenAPI spec will be written, relative to your `vite.config.ts` file.

**openapi** - OpenAPI version specification. Use `"3.1.0"` or any `3.1.x` version.

**info** - API metadata object containing:
- `title` (required) - Name of your API
- `version` (required) - API version following semantic versioning

**servers** - Array of server objects, each containing:
- `url` (required) - Base URL where the API is served
- `description` (optional) - Human-readable server description

### Optional Info Properties

The `info` object accepts additional optional properties for richer documentation:

**summary** - Short summary of your API (one line)

**description** - Detailed description supporting markdown formatting

**termsOfService** - URL to your API's terms of service

**contact** - Contact information object:
- `name` - Contact name
- `url` - URL to contact page
- `email` - Contact email address

**license** - License information object:
- `name` (required) - License name (e.g., "MIT", "Apache 2.0")
- `identifier` - SPDX license identifier
- `url` - URL to full license text

### Complete Example

```typescript
import devPlugin from "@amperjs/dev";
import openapiGenerator from "@amperjs/openapi-generator";

export default {
  plugins: [
    devPlugin(apiurl, {
      generators: [
        openapiGenerator({
          outfile: "openapi.json",
          openapi: "3.1.0",
          info: {
            title: "My SaaS API",
            version: "2.1.0",
            summary: "RESTful API for My SaaS Platform",
            description: `
# API Documentation

This API provides access to all platform features including
user management, billing, and analytics.

## Authentication

All endpoints require a valid API key passed in the \`Authorization\` header.
            `,
            termsOfService: "https://myapp.com/terms",
            contact: {
              name: "API Support",
              url: "https://myapp.com/support",
              email: "api@myapp.com"
            },
            license: {
              name: "Apache 2.0",
              url: "https://www.apache.org/licenses/LICENSE-2.0.html"
            }
          },
          servers: [
            {
              url: "http://localhost:4000",
              description: "Development server"
            },
            {
              url: "https://staging-api.myapp.com",
              description: "Staging environment"
            },
            {
              url: "https://api.myapp.com",
              description: "Production server"
            }
          ],
        }),
      ],
    }),
  ],
}
```

