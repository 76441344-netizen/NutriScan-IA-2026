# NutriScan IA

Aplicación web que ayuda a madres a generar recetas saludables para sus hijos usando IA, con enfoque en la prevención de anemia infantil.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/nutriscan run dev` — run the frontend (port 25715)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GROQ_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, wouter, react-hook-form + zod, shadcn/ui
- API: Express 5 with Groq SDK for AI generation
- DB: PostgreSQL + Drizzle ORM (tables: users, recipes)
- AI: Groq API (llama-3.3-70b-versatile) for recipe generation
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/users.ts` — users table schema
- `lib/db/src/schema/recipes.ts` — recipes table schema
- `artifacts/nutriscan/src/pages/` — all app pages
- `artifacts/nutriscan/src/lib/auth.ts` — localStorage userId helpers
- `artifacts/api-server/src/routes/users.ts` — user CRUD routes
- `artifacts/api-server/src/routes/recipes.ts` — recipe generation + history routes

## Architecture decisions

- Frontend-only auth: userId stored in localStorage (no session server needed for MVP)
- AI generation happens server-side: Groq key never exposed to browser
- All generated recipes are persisted to Postgres immediately after AI generation
- Groq model: llama-3.3-70b-versatile — best balance of speed and quality for Spanish nutritional content
- Supabase env vars are provisioned but Replit Postgres is used for all persistence (more integrated)

## Product

- Landing page explaining NutriScan IA purpose (anti-anemia recipes for kids)
- User registration form (nombre, integrantes, niños, edades, presupuesto, tiempo_cocina)
- Dashboard with 3 main actions + quick stats (total recipes, this month, top ingredient)
- Ingredient input form → AI generates complete recipe in Spanish
- Recipe shows: nombre, ingredientes, pasos, tiempo_preparacion, beneficios, prevención de anemia
- Recipe history with delete + view detail
- Editable user profile

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `GROQ_API_KEY` must be set as a secret (not env var) for the API server
- After OpenAPI spec changes, always run codegen before frontend work
- DB push required after schema changes: `pnpm --filter @workspace/db run push`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
