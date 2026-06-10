# SME Business Manager — Claude Code Memory

## Project Identity
- **Product:** SME Business Manager — CRM + Inventory + Orders
- **Owner:** Renato C. Javier Jr. (Full-Stack Engineer, React / Node.js)
- **Purpose:** Upwork portfolio anchor + freelance client demo (SaaS / white-label)
- **Target:** SMEs 10–50 people, PH + US/EU remote clients
- **Status:** Active build — see SESSION_LOG.md for current progress

---

## Architecture at a Glance
- **Frontend:** Next.js 14 (App Router) → deployed on Vercel
- **Backend:** Node.js + Express (REST API) → deployed on Railway
- **Database:** MySQL → Railway managed instance
- **Cache:** Upstash Redis (rate limiting + response cache)
- **Monorepo:** apps/web · apps/api · packages/shared · packages/db

## Tech Stack Quick Reference
| Concern | Tool |
|---|---|
| Frontend framework | Next.js 14 App Router |
| UI components | MUI v6 |
| Server state | TanStack React Query v5 |
| Client/UI state | Zustand |
| Drag & drop | @dnd-kit |
| Charts | Recharts |
| HTTP client | Axios (with interceptors) |
| Backend | Node.js + Express |
| Database client | mysql2 (prepared statements only) |
| Auth | JWT — AT in memory, RT in httpOnly cookie |
| Validation | Zod (shared FE + BE schemas) |
| Rate limiting | express-rate-limit + Upstash Redis |
| Logging | Winston + Morgan |
| Error tracking | Sentry (FE error boundaries + BE exceptions) |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |
| Language | TypeScript throughout |
| CI/CD | GitHub Actions |

---

## Absolute Rules (Never Violate)
- **Never store tokens in localStorage** — AT in memory (Zustand), RT in httpOnly cookie only
- **Never use raw SQL string interpolation** — always use mysql2 prepared statements
- **Never log passwords, tokens, or PII** — sanitize before Winston logs
- **Never commit .env files** — all secrets via environment variables
- **Never use WidthType.PERCENTAGE in docx** — not applicable here, ignore
- **Always validate inputs with Zod** — both on FE (form validation) and BE (API middleware)
- **Always invalidate React Query cache on mutations** — no stale data after write operations
- **Always use ShadingType.CLEAR for table shading** — not applicable here, ignore

## Code Conventions
- **TypeScript strict mode** — no `any` types
- **Named exports** preferred over default exports (except Next.js pages/layouts)
- **Absolute imports** — use `@/` for web app, `~api/` for backend
- **Error responses** — always return `{ success: false, error: string, code: string }`
- **Success responses** — always return `{ success: true, data: T }`
- **API routes** — RESTful, versioned under `/api/v1/`
- **React components** — one component per file, filename matches component name
- **Hooks** — prefix with `use`, keep in `/hooks` directory
- **Constants** — UPPER_SNAKE_CASE, kept in `/constants` directory

## Folder Structure
```
sme-biz-manager/
├── apps/
│   ├── web/                    # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, register routes
│   │   │   ├── (dashboard)/    # Protected app routes
│   │   │   │   ├── crm/
│   │   │   │   ├── inventory/
│   │   │   │   └── orders/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable MUI-based components
│   │   │   ├── crm/
│   │   │   ├── inventory/
│   │   │   └── orders/
│   │   ├── hooks/
│   │   ├── lib/                # axios instance, queryClient, utils
│   │   ├── store/              # Zustand stores
│   │   └── types/
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/     # auth, rateLimiter, validate, logger
│       │   ├── services/       # business logic layer
│       │   ├── db/             # mysql2 connection, query helpers
│       │   └── utils/
│       └── index.ts
├── packages/
│   ├── shared/                 # Shared Zod schemas + TypeScript types
│   └── db/                    # Migrations + seed scripts
├── .github/
│   └── workflows/
│       └── ci.yml
├── CLAUDE.md                   # This file — Claude Code memory
├── SESSION_LOG.md              # Session-by-session progress log
├── BUGLOG.md                   # Bug tracker
└── DECISIONS.md                # Architecture decision records
```

---

## Module Scope Summary

### CRM
- Contacts: full CRUD, search, pagination
- Deals: Kanban board (Lead / Active / Closed), drag-and-drop via @dnd-kit
- Notes: per-contact, timestamped, author-tracked
- Activity log: per-deal, auto-generated on status change

### Inventory
- Products: SKU, name, category, unit price, stock qty, low-stock threshold
- Stock movements: stock-in / stock-out with reason codes + timestamps
- Low-stock alerts: visual indicator when qty < threshold
- Dashboard: total products, stock value, low-stock count

### Orders
- Create order: link contact + one or more products, auto-calculate total
- Status: Pending → Fulfilled / Cancelled, audit trail on change
- Order history: filterable by date range, status, contact
- Invoice summary: printable per-order view

### Auth + RBAC
- Roles: Admin (full access), Staff (read + limited write)
- AT: JWT, 15min expiry, memory-only storage
- RT: JWT, 7-day expiry, httpOnly + Secure + SameSite=Strict cookie
- Refresh rotation: new RT on every refresh call
- Concurrent request queue: held during token refresh, replayed after

---

## Seed Data (npm run seed)
- **Admin:** admin@demo.com / Demo@1234
- **Staff:** staff@demo.com / Demo@1234
- 25 contacts · 15 deals · 20 products · 60 stock movements · 18 orders
- Seed is idempotent — safe to re-run

---

## Environment Variables Required
### apps/api/.env
```
NODE_ENV=development
PORT=4000
DB_HOST=
DB_PORT=3306
DB_NAME=sme_biz
DB_USER=
DB_PASSWORD=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
SENTRY_DSN=
CLIENT_URL=http://localhost:3000
```
### apps/web/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Key External Links
- Railway dashboard: https://railway.app
- Vercel dashboard: https://vercel.com
- Upstash console: https://upstash.com
- Sentry project: https://sentry.io
- GitHub repo: https://github.com/Z360R/sme-biz-manager
- Live demo URL: (update when deployed)

---

## Current Session
> See SESSION_LOG.md for latest session details and progress.
