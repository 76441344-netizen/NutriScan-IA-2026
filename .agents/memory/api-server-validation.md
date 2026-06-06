---
name: API server validation approach
description: How to validate request bodies in the api-server package
---

The `@workspace/api-server` package does NOT have `zod` or `zod/v4` as a dependency. Do not import from those.

**Why:** Only `@workspace/api-zod` (generated Orval schemas), `@workspace/db`, and Express-related packages are in its dependencies.

**How to apply:**
- For routes that map to OpenAPI operations: import Zod schemas from `@workspace/api-zod` (e.g. `CreateUserBody`, `GetUserParams`)
- For custom/internal routes (like scans): use manual TypeScript type assertions + runtime checks instead of Zod
