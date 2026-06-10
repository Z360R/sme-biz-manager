# Feature Registry — SME Business Manager

> Claude Code updates this file when a feature is implemented or when scope changes.
> Use this as the single source of truth for what's built vs planned vs deferred.

---

## Status Legend
| Status | Meaning |
|---|---|
| 📋 PLANNED | In scope, not started |
| 🚧 IN PROGRESS | Currently being built |
| ✅ DONE | Implemented and working |
| 🧪 NEEDS TEST | Implemented but missing test coverage |
| 🔵 DEFERRED | Moved to post-MVP backlog |
| ❌ CANCELLED | Removed from scope |

---

## Infrastructure & Setup

| Feature | Status | Session | Notes |
|---|---|---|---|
| Monorepo (pnpm workspaces) | ✅ DONE | S1 | root package.json + pnpm-workspace.yaml |
| Next.js 14 App Router scaffold | ✅ DONE | S1 | MUI v6 + React Query v5 + Zustand wired |
| Express + TypeScript scaffold | ✅ DONE | S1 | Winston + Morgan + CORS + error handler |
| packages/shared Zod schemas | ✅ DONE | S1 | All 4 modules — types + schemas defined |
| MySQL schema + migrations | ✅ DONE | S1 | 11 tables, idempotent SQL, migrate script |
| Railway deployment (backend) | 📋 PLANNED | S1 | Needs Railway CLI + credentials |
| Vercel deployment (frontend) | 📋 PLANNED | S1 | Needs Vercel CLI |
| GitHub Actions CI pipeline | ✅ DONE | S1 | typecheck + test jobs |
| Environment variable setup | ✅ DONE | S1 | .env.example files for all packages |
| Health check endpoint (/health) | ✅ DONE | S1 | GET /api/v1/health — pings DB |

---

## Auth Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Login endpoint (POST /auth/login) | 📋 PLANNED | S5 | |
| Refresh endpoint (POST /auth/refresh) | 📋 PLANNED | S5 | |
| Logout endpoint (POST /auth/logout) | 📋 PLANNED | S5 | |
| JWT Access Token (memory storage) | 📋 PLANNED | S5 | |
| JWT Refresh Token (httpOnly cookie) | 📋 PLANNED | S5 | |
| Refresh token rotation | 📋 PLANNED | S5 | |
| Axios interceptor — silent AT refresh | 📋 PLANNED | S5 | |
| Concurrent request queue during refresh | 📋 PLANNED | S5 | |
| RBAC — Admin role | 📋 PLANNED | S5 | |
| RBAC — Staff role | 📋 PLANNED | S5 | |
| Protected route middleware (BE) | 📋 PLANNED | S5 | |
| Protected route guard (FE) | 📋 PLANNED | S5 | |
| Login page UI | 📋 PLANNED | S5 | |
| bcrypt password hashing | 📋 PLANNED | S5 | |

---

## CRM Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Contacts list (paginated table) | 📋 PLANNED | S2 | |
| Contact search + filter | 📋 PLANNED | S2 | |
| Create contact (modal form) | 📋 PLANNED | S2 | |
| Edit contact | 📋 PLANNED | S2 | |
| Delete contact (soft delete) | 📋 PLANNED | S2 | |
| Contact detail view | 📋 PLANNED | S2 | |
| Deals Kanban board | 📋 PLANNED | S2 | |
| Drag-and-drop deal cards (@dnd-kit) | 📋 PLANNED | S2 | |
| Create deal | 📋 PLANNED | S2 | |
| Edit deal | 📋 PLANNED | S2 | |
| Delete deal | 📋 PLANNED | S2 | |
| Notes per contact | 📋 PLANNED | S2 | |
| Activity log per deal | 📋 PLANNED | S2 | |
| CRM dashboard summary cards | 📋 PLANNED | S2 | |

---

## Inventory Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Products list (paginated table) | 📋 PLANNED | S3 | |
| Product search + filter by category | 📋 PLANNED | S3 | |
| Create product | 📋 PLANNED | S3 | |
| Edit product | 📋 PLANNED | S3 | |
| Delete product (soft delete) | 📋 PLANNED | S3 | |
| Stock-in entry | 📋 PLANNED | S3 | |
| Stock-out entry | 📋 PLANNED | S3 | |
| Low-stock threshold per product | 📋 PLANNED | S3 | |
| Low-stock visual alert indicator | 📋 PLANNED | S3 | |
| Stock movement history table | 📋 PLANNED | S3 | |
| Inventory dashboard summary | 📋 PLANNED | S3 | |
| Stock trend chart (Recharts) | 📋 PLANNED | S3 | |

---

## Orders Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Create order (contact + products) | 📋 PLANNED | S4 | |
| Auto-calculate order total | 📋 PLANNED | S4 | |
| Order status — Pending | 📋 PLANNED | S4 | |
| Order status — Fulfilled | 📋 PLANNED | S4 | |
| Order status — Cancelled | 📋 PLANNED | S4 | |
| Status change audit trail | 📋 PLANNED | S4 | |
| Order history table (filterable) | 📋 PLANNED | S4 | |
| Order detail view | 📋 PLANNED | S4 | |
| Invoice summary (printable) | 📋 PLANNED | S4 | |

---

## Infrastructure / Production Readiness

| Feature | Status | Session | Notes |
|---|---|---|---|
| Rate limiting — global (100/15min) | 📋 PLANNED | S6 | |
| Rate limiting — auth routes (10/15min) | 📋 PLANNED | S6 | |
| Rate limiting — write ops (30/15min) | 📋 PLANNED | S6 | |
| Redis-backed rate limit store | 📋 PLANNED | S6 | |
| 429 UI fallback (toast + button disable) | 📋 PLANNED | S6 | |
| React Query stale-while-revalidate | 📋 PLANNED | S2 | Configured at setup |
| Redis response cache (dashboard agg) | 📋 PLANNED | S6 | |
| Winston structured logging | ✅ DONE | S1 | Pretty in dev, JSON in prod |
| Morgan request logging | ✅ DONE | S1 | Streams into Winston logger |
| Sentry — FE error boundaries | 📋 PLANNED | S6 | |
| Sentry — BE exception capture | 📋 PLANNED | S6 | |
| Security headers (Next.js middleware) | 📋 PLANNED | S6 | |
| CORS configuration | ✅ DONE | S1 | origin = CLIENT_URL, credentials: true |

---

## Seed Data

| Feature | Status | Session | Notes |
|---|---|---|---|
| Admin + Staff user accounts | 📋 PLANNED | S6 | |
| 25 sample contacts | 📋 PLANNED | S6 | |
| 15 sample deals (3 stages) | 📋 PLANNED | S6 | |
| 20 sample products (5 low-stock) | 📋 PLANNED | S6 | |
| 60 stock movements (30-day history) | 📋 PLANNED | S6 | |
| 18 sample orders (3 statuses) | 📋 PLANNED | S6 | |
| Notes + activity log entries | 📋 PLANNED | S6 | |
| Idempotent seed command | 📋 PLANNED | S6 | |

---

## Testing

| Feature | Status | Session | Notes |
|---|---|---|---|
| Vitest — auth flow unit tests | 📋 PLANNED | S7 | |
| Vitest — form validation tests | 📋 PLANNED | S7 | |
| Vitest — Zustand store tests | 📋 PLANNED | S7 | |
| RTL — Login component test | 📋 PLANNED | S7 | |
| Playwright — TC-01 Auth flow | 📋 PLANNED | S7 | |
| Playwright — TC-02 Create contact | 📋 PLANNED | S7 | |
| Playwright — TC-03 Stock entry | 📋 PLANNED | S7 | |
| Playwright — TC-04 Create order | 📋 PLANNED | S7 | |

---

## Post-MVP Backlog

> Features that came up during build but were intentionally deferred.
> Claude Code adds items here instead of building them during MVP sessions.

| Feature | Reason Deferred | Priority |
|---|---|---|
| | | |

---

_Last updated: Session 1 — 2026-06-10_
