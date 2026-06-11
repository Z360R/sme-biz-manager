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
| CI + tsconfig corrections (9 bugs) | ✅ DONE | S3 | See BUGLOG BUG-3-001 → BUG-3-009 |

---

## Auth Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Login endpoint (POST /auth/login) | 📋 PLANNED | S6 | |
| Refresh endpoint (POST /auth/refresh) | 📋 PLANNED | S6 | |
| Logout endpoint (POST /auth/logout) | 📋 PLANNED | S6 | |
| JWT Access Token (memory storage) | 📋 PLANNED | S6 | |
| JWT Refresh Token (httpOnly cookie) | 📋 PLANNED | S6 | |
| Refresh token rotation | 📋 PLANNED | S6 | |
| Axios interceptor — silent AT refresh | 📋 PLANNED | S6 | |
| Concurrent request queue during refresh | 📋 PLANNED | S6 | |
| RBAC — Admin role | 📋 PLANNED | S6 | |
| RBAC — Staff role | 📋 PLANNED | S6 | |
| Protected route middleware (BE) | 📋 PLANNED | S6 | |
| Protected route guard (FE) | 📋 PLANNED | S6 | |
| Login page UI | 📋 PLANNED | S6 | |
| bcrypt password hashing | 📋 PLANNED | S6 | |

---

## CRM Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Contacts list (paginated table) | ✅ DONE | S2 | Server-side pagination + search |
| Contact search + filter | ✅ DONE | S2 | LIKE search across name/email/company |
| Create contact (modal form) | ✅ DONE | S2 | RHF + Zod validation |
| Edit contact | ✅ DONE | S2 | Same modal, pre-filled |
| Delete contact (soft delete) | ✅ DONE | S2 | Sets deleted_at, filters from queries |
| Contact detail view | ✅ DONE | S2 | /crm/contacts/[id] page |
| Deals Kanban board | ✅ DONE | S2 | Three columns: Lead / Active / Closed |
| Drag-and-drop deal cards (@dnd-kit) | ✅ DONE | S2 | Stage updated on drop |
| Create deal | ✅ DONE | S2 | Modal with contact selector |
| Edit deal | ✅ DONE | S2 | Same modal, pre-filled |
| Delete deal | ✅ DONE | S2 | Hard delete |
| Notes per contact | ✅ DONE | S2 | On contact detail page |
| Activity log per deal | ✅ DONE | S2 | Auto-logged on create + stage change |
| CRM dashboard summary cards | ✅ DONE | S2 | /crm — contacts + deals by stage |

---

## Inventory Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Products list (paginated table) | 📋 PLANNED | S4 | |
| Product search + filter by category | 📋 PLANNED | S4 | |
| Create product | 📋 PLANNED | S4 | |
| Edit product | 📋 PLANNED | S4 | |
| Delete product (soft delete) | 📋 PLANNED | S4 | |
| Stock-in entry | 📋 PLANNED | S4 | |
| Stock-out entry | 📋 PLANNED | S4 | |
| Low-stock threshold per product | 📋 PLANNED | S4 | |
| Low-stock visual alert indicator | 📋 PLANNED | S4 | |
| Stock movement history table | 📋 PLANNED | S4 | |
| Inventory dashboard summary | 📋 PLANNED | S4 | |
| Stock trend chart (Recharts) | 📋 PLANNED | S4 | |

---

## Orders Module

| Feature | Status | Session | Notes |
|---|---|---|---|
| Create order (contact + products) | 📋 PLANNED | S5 | |
| Auto-calculate order total | 📋 PLANNED | S5 | |
| Order status — Pending | 📋 PLANNED | S5 | |
| Order status — Fulfilled | 📋 PLANNED | S5 | |
| Order status — Cancelled | 📋 PLANNED | S5 | |
| Status change audit trail | 📋 PLANNED | S5 | |
| Order history table (filterable) | 📋 PLANNED | S5 | |
| Order detail view | 📋 PLANNED | S5 | |
| Invoice summary (printable) | 📋 PLANNED | S5 | |

---

## Infrastructure / Production Readiness

| Feature | Status | Session | Notes |
|---|---|---|---|
| Rate limiting — global (100/15min) | 📋 PLANNED | S7 | |
| Rate limiting — auth routes (10/15min) | 📋 PLANNED | S7 | |
| Rate limiting — write ops (30/15min) | 📋 PLANNED | S7 | |
| Redis-backed rate limit store | 📋 PLANNED | S7 | |
| 429 UI fallback (toast + button disable) | 📋 PLANNED | S7 | |
| React Query stale-while-revalidate | 📋 PLANNED | S2 | Configured at setup |
| Redis response cache (dashboard agg) | 📋 PLANNED | S7 | |
| Winston structured logging | ✅ DONE | S1 | Pretty in dev, JSON in prod |
| Morgan request logging | ✅ DONE | S1 | Streams into Winston logger |
| Sentry — FE error boundaries | 📋 PLANNED | S7 | |
| Sentry — BE exception capture | 📋 PLANNED | S7 | |
| Security headers (Next.js middleware) | 📋 PLANNED | S7 | |
| CORS configuration | ✅ DONE | S1 | origin = CLIENT_URL, credentials: true |

---

## Seed Data

| Feature | Status | Session | Notes |
|---|---|---|---|
| Admin + Staff user accounts | 📋 PLANNED | S7 | |
| 25 sample contacts | 📋 PLANNED | S7 | |
| 15 sample deals (3 stages) | 📋 PLANNED | S7 | |
| 20 sample products (5 low-stock) | 📋 PLANNED | S7 | |
| 60 stock movements (30-day history) | 📋 PLANNED | S7 | |
| 18 sample orders (3 statuses) | 📋 PLANNED | S7 | |
| Notes + activity log entries | 📋 PLANNED | S7 | |
| Idempotent seed command | 📋 PLANNED | S7 | |

---

## Testing

| Feature | Status | Session | Notes |
|---|---|---|---|
| Vitest — auth flow unit tests | 📋 PLANNED | S8 | |
| Vitest — form validation tests | 📋 PLANNED | S8 | |
| Vitest — Zustand store tests | 📋 PLANNED | S8 | |
| RTL — Login component test | 📋 PLANNED | S8 | |
| Playwright — TC-01 Auth flow | 📋 PLANNED | S8 | |
| Playwright — TC-02 Create contact | 📋 PLANNED | S8 | |
| Playwright — TC-03 Stock entry | 📋 PLANNED | S8 | |
| Playwright — TC-04 Create order | 📋 PLANNED | S8 | |

---

## Post-MVP Backlog

> Features that came up during build but were intentionally deferred.
> Claude Code adds items here instead of building them during MVP sessions.

| Feature | Reason Deferred | Priority |
|---|---|---|
| | | |

---

_Last updated: Session 3 — 2026-06-11_
