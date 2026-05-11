# Dashboard

Typed full-stack dashboard. TanStack Start + Router + Query + Table on the frontend, Prisma + Postgres on the backend, cookie-session auth with two roles (USER, ADMIN).

## Stack

- TanStack Start (Vite + Nitro) — SSR + server functions
- TanStack Router — file-based routes, type-safe
- TanStack Query — caching, mutations, SSR hydration
- TanStack Table — sortable + searchable table
- Prisma + Postgres (Neon)
- bcryptjs + signed cookie session (`@tanstack/react-start/server` `useSession`)
- Tailwind CSS v4
- Deploys to Vercel via Nitro `vercel` preset

No `any`, no `unknown` leaks. `strict` + `noUncheckedIndexedAccess` on.

## Local setup

```bash
cp .env.example .env
# fill DATABASE_URL with your Neon connection string
# set SESSION_SECRET to a random 32+ char string
#   openssl rand -base64 48

npm install
npm run db:push     # create tables on your Neon DB
npm run db:seed     # creates 1 admin + 1 user + sample rated users
npm run dev
```

Open http://localhost:3000.

### Seeded accounts

| Email                | Password   | Role  |
| -------------------- | ---------- | ----- |
| admin@example.com    | admin123   | ADMIN |
| user@example.com     | user123    | USER  |

The admin sees an **Add user** button in the header; clicking it opens a modal with `user` + `rating` fields. The list updates immediately on success.

## Routes

- `/` — redirects to `/dashboard` or `/login` based on session
- `/login` — sign-in form
- `/dashboard` — protected; rated-users table with search + sort

## Deploying to Vercel

1. Push the repo to GitHub.
2. Create a Vercel project, import the repo. No framework preset needed — Vercel detects Vite + outputs the Nitro `vercel` preset because `VERCEL=1` is set at build time.
3. Set env vars in the Vercel project:
   - `DATABASE_URL` — your Neon Postgres connection string (use the *pooled* URL, `?sslmode=require`)
   - `SESSION_SECRET` — random 32+ char string
4. After the first deploy, run `npm run db:push` locally pointing at the same `DATABASE_URL`, then `npm run db:seed`.

Build command: `npm run build` (defaults). Output: `.output/`.

## Project layout

```
prisma/
  schema.prisma     # AuthUser, RatedUser, Role enum
  seed.ts           # admin + user + sample rows
src/
  routes/           # __root.tsx, index.tsx, login.tsx, dashboard.tsx
  components/       # header, users-table, add-user-modal
  lib/
    auth.ts             # server fns: loginFn, logoutFn, getCurrentUserFn
    auth.server.ts      # requireUser, requireAdmin (server-only)
    auth-types.ts       # CurrentUser type
    session.server.ts   # useAppSession (cookie session)
    db.server.ts        # PrismaClient singleton
    rated-users.ts      # listRatedUsersFn, addRatedUserFn, query options
  router.tsx        # getRouter() with Query integration
  styles/app.css    # Tailwind + theme tokens
vite.config.ts
```

Files suffixed `.server.ts` are not bundled into the client — they hold the cookie session and Prisma client.
