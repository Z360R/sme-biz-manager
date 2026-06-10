# Architecture Decision Records — SME Business Manager

> Key technical decisions made during the build are recorded here.
> Decisions should be logged when they involve a non-obvious tradeoff,
> a deviation from the original spec, or a choice that future sessions need context for.
> Claude Code logs decisions here when they arise naturally during a session.

---

## ADR Format

Each record answers three questions:
- **What** was decided
- **Why** this choice was made over alternatives
- **What** the tradeoff or consequence is

---

## Pre-Build Decisions (From Spec)

### ADR-001 — Next.js over plain React + Express split

**Decision:** Use Next.js 14 (App Router) for the frontend instead of Vite + separate Express API.

**Rationale:**
- API routes built-in — single repo, simpler local dev
- SSR/SSG capability improves perceived performance and SEO (if ever public-facing)
- Next.js is a stronger Upwork keyword signal than plain React
- Vercel deployment is a single command with zero config

**Tradeoff:** App Router learning curve vs Pages Router familiarity. Accepted — App Router is the industry direction.

---

### ADR-002 — Zustand over Redux for client state

**Decision:** Zustand for UI/client state, TanStack React Query for server state.

**Rationale:**
- Redux adds significant boilerplate for an MVP with one engineer
- Zustand is minimal, TypeScript-friendly, and sufficient for modal state, session, and UI flags
- React Query handles all async/server state — Zustand never stores API data

**Tradeoff:** Less structured than Redux. Accepted for MVP; can migrate if team grows.

---

### ADR-003 — AT in memory, RT in httpOnly cookie

**Decision:** Access Token stored in Zustand (memory only). Refresh Token in httpOnly + Secure + SameSite=Strict cookie.

**Rationale:**
- localStorage is XSS-vulnerable — any injected script can steal tokens
- httpOnly cookies are inaccessible to JavaScript — XSS-safe
- This follows OWASP Token Storage recommendations
- Strong talking point during client security reviews

**Tradeoff:** AT lost on page refresh — requires a silent refresh call on app load. Acceptable UX tradeoff for security.

---

### ADR-004 — mysql2 raw queries over ORM (Prisma/TypeORM)

**Decision:** Use mysql2 with prepared statements directly, no ORM.

**Rationale:**
- ORMs add abstraction that obscures SQL — harder to debug performance issues
- Prepared statements prevent SQL injection natively
- mysql2 is lighter and faster to set up for an MVP
- Engineer has strong MySQL background — raw queries are more comfortable

**Tradeoff:** More verbose queries, no automatic migrations from schema. Mitigated by keeping migrations in packages/db/migrations/.

---

### ADR-005 — Upstash Redis over in-memory rate limiting

**Decision:** Use Upstash Redis as the store for express-rate-limit instead of the default in-memory store.

**Rationale:**
- In-memory rate limits reset on server restart — Redis persists across restarts
- Railway may spin up multiple instances — in-memory limits are per-instance only
- Upstash free tier is sufficient for MVP and demo usage
- Adds minimal complexity for significant production-readiness improvement

**Tradeoff:** External dependency. Mitigated by falling back gracefully if Redis is unavailable.

---

### ADR-006 — pnpm workspaces for monorepo

**Decision:** Use pnpm workspaces to manage the monorepo (apps/web, apps/api, packages/*).

**Rationale:**
- pnpm is faster and more disk-efficient than npm/yarn for monorepos
- Workspace protocol allows packages/shared to be imported by both apps
- Better dependency isolation than hoisting-by-default npm behavior

**Tradeoff:** pnpm must be installed globally. Documented in README.

---

## In-Build Decisions

### ADR-007 — tsconfig `paths` to resolve `@sme/shared` from TypeScript source

**Decision:** Both `apps/api` and `apps/web` tsconfigs include a path alias pointing `@sme/shared` to `../../packages/shared/src/index.ts` (TypeScript source). `apps/web` also sets `transpilePackages: ['@sme/shared']` in next.config.ts.

**Rationale:**
- tsx (API dev server) resolves TypeScript source via tsconfig paths without a pre-build step
- Next.js with `transpilePackages` compiles the shared source directly through webpack
- Type checker (TypeScript LS in VS Code) uses paths for accurate intellisense
- No pre-build step required to start development — `pnpm dev` just works

**Tradeoff:** CI must build shared before running API production build (`tsc && tsc-alias`). Documented in CI workflow and root `build` script.

---

### ADR-008 — `tsc-alias` for `~api/*` path resolution in API production build

**Decision:** Added `tsc-alias` as a post-tsc step in `apps/api` build (`"build": "tsc && tsc-alias"`).

**Rationale:**
- TypeScript compiles `~api/` path aliases but does not rewrite them in the emitted JS
- At runtime, Node.js cannot resolve `~api/utils/logger` — it expects relative or node_modules paths
- `tsc-alias` rewrites the compiled output to use correct relative paths
- Alternative (tsup bundler) was rejected to keep the stack lean for MVP

**Tradeoff:** Extra dev dependency and build step. Accepted — the rewrite is deterministic and adds ~1s to build time.

---

### ADR-009 — Explicit `IRouter` / `Application` type annotations on Express exports

**Decision:** All exported Express `Router()` instances are annotated as `IRouter` and the app as `Application`.

**Rationale:**
- pnpm's symlinked `@types/express` creates internal paths like `.pnpm/@types+express-serve-static-core@...` that TypeScript's `declaration: true` cannot resolve portably.
- Explicit annotations stop TypeScript from trying to infer and serialize these opaque types.

**Tradeoff:** Minor verbosity. No functional impact.
