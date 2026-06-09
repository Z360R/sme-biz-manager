# Claude Code Instructions — SME Business Manager

> This file gives Claude Code persistent context about how to work on this project.
> Read this alongside CLAUDE.md at the start of every session.

---

## Your Role in This Project

You are the primary code generation engine for this project. The engineer (Renato) provides direction, reviews output, makes architectural calls, and handles decisions that require human judgment. You generate boilerplate, scaffold modules, write tests, and help debug.

**Do not gold-plate.** If a feature isn't in FEATURES.md, add it to the Post-MVP Backlog section and move on. Scope discipline is critical — this is an MVP with a same-day delivery target.

---

## Session Start Protocol

At the start of every session, before writing any code:
1. Read `CLAUDE.md` — understand the full stack and rules
2. Read `SESSION_LOG.md` — understand what was done in prior sessions
3. Read `BUGLOG.md` — check for any open bugs that may affect this session
4. Read `FEATURES.md` — confirm what's done vs planned
5. Summarize current state to the engineer and confirm the session goal

---

## Session End Protocol

At the end of every session, before closing:
1. Update `SESSION_LOG.md` — add a new entry with everything completed
2. Update `FEATURES.md` — change statuses from PLANNED/IN PROGRESS to DONE
3. Update `BUGLOG.md` — add any new bugs, mark resolved ones as 🟢 RESOLVED
4. Update `DECISIONS.md` — log any non-obvious architectural decisions made
5. Note what's next for the following session

---

## Code Generation Rules

### TypeScript
- Always use strict TypeScript — no `any`, no `@ts-ignore` without explanation
- Define interfaces/types in `packages/shared/types/` when used by both FE and BE
- Use Zod for validation schemas — define once in `packages/shared/schemas/`

### API Design
- All routes under `/api/v1/`
- Response shape: `{ success: true, data: T }` or `{ success: false, error: string, code: string }`
- Always use mysql2 prepared statements — never string-interpolate SQL
- Apply auth middleware to all routes except `/auth/login` and `/auth/refresh`
- Apply rate limiting middleware at the router level

### Frontend
- Use Next.js App Router conventions — `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Server Components by default — add `"use client"` only when needed (interactivity, hooks, browser APIs)
- All data fetching via React Query — no raw `fetch` or `useEffect` for server data
- All forms use React Hook Form + Zod resolver
- All modals/dialogs use MUI Dialog
- All tables use MUI DataGrid or a custom MUI Table — consistent across modules

### Auth Handling
- Never store AT in localStorage or sessionStorage
- AT lives in Zustand `authStore` — exported as `useAuthStore()`
- Axios instance in `apps/web/lib/axios.ts` — has request interceptor (attach AT) and response interceptor (handle 401, refresh, retry)
- On 401: call `/auth/refresh`, get new AT, retry original request
- If refresh fails: clear auth state, redirect to `/login`

### Error Handling
- All API errors caught in Axios response interceptor — normalized before reaching components
- React Query `onError` callbacks show MUI Snackbar toasts
- 429 responses: show toast "Too many requests — please wait", disable trigger element, exponential backoff retry
- Unhandled errors caught by React Error Boundary — reported to Sentry

---

## What NOT to Do

- Do not install packages not in the approved stack without asking first
- Do not create files outside the defined folder structure without explaining why
- Do not use `console.log` in production code — use Winston logger on BE, Sentry on FE
- Do not write inline styles — use MUI `sx` prop or `styled()` API
- Do not put business logic in React components — extract to custom hooks or service functions
- Do not skip Zod validation on any API endpoint that accepts a request body
- Do not commit secrets or hardcode URLs — always use env vars

---

## Preferred Patterns

### Zustand Store
```typescript
// store/authStore.ts
interface AuthState {
  accessToken: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}))
```

### React Query Mutation with Cache Invalidation
```typescript
const { mutate } = useMutation({
  mutationFn: (data: CreateContactDto) => contactsApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
    showToast('Contact created', 'success')
    onClose()
  },
  onError: (error) => showToast(error.message, 'error'),
})
```

### Express Route Pattern
```typescript
// routes/contacts.ts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await contactsService.getAll(req.query)
    res.json({ success: true, data: contacts })
  } catch (error) {
    logger.error('GET /contacts error', { error })
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' })
  }
})
```

---

## Demo Credentials (Seed Data)
- **Admin:** admin@demo.com / Demo@1234
- **Staff:** staff@demo.com / Demo@1234
