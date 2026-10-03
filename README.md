# Synthos — Kenya's Creative Job Board & Talent Marketplace

Synthos is a job posting site for Kenya's creative sector. Companies post roles, talent apply, and employers hire verified creative professionals.

- **For companies** — register, post jobs, review applications, hire talent
- **For talent** — build a profile and portfolio, browse open gigs, apply, track applications

---

## Objectives

**1. Make every listing trustworthy.** A job board lives or dies on whether a posting is real. Companies submit, admins approve, and only approved listings reach the board. Job reports go to a moderation queue instead of instantly hiding a listing, so a single bad report can't remove a real employer's role while genuine applicants are unaffected.

**2. Make employers verifiable.** A "Verified" badge should mean something. Companies register unverified, submit documents, and are approved by a human who is recorded on the company record. Verification gates the public directory and unlocks job posting.

**3. Give talent a profile that does work.** Talent present skills, rates, availability and portfolios, so they can be judged on the work rather than on a CV. Following an employer is one-way and frictionless; connection requests remain a separate, deliberate act.

**4. Get an applicant to hired without friction.** Apply, review, accept or reject. A talent account tracks applications and deadlines; a company account tracks every applicant against every role it posted.

**5. Earn trust at every step.** Verified employers are visually distinct, reviewed listings carry approval, and no fabricated statistics or vanity metrics appear anywhere. Empty states say what is missing rather than filling space.

---

## Not a goal

Synthos is a job board, not an agency workflow tool. Briefs, transcripts, proposals, quotes and project delivery exist in the codebase but are not part of the product's direction — the product stops at hire.

---

## The market

### Job board

- **`/jobs`** — approved listings from verified companies, with search and filtering
- **`/jobs/[id]`** — full listing, apply, or report the listing
- Job lifecycle: a company submits a role as `pending`, an admin approves it, and only then does it appear publicly
- Three open reports on a listing demote it to `pending` so it leaves the board pending review. One report never hides a listing on its own
- Reports go to a moderation queue at `/admin/jobs/reports` rather than removing the listing outright

### Talent

- **`/talents`** — directory of creative professionals with skills, rates, availability and ratings
- **`/talents/[id]`** — public profile with portfolio, availability and follow
- Follow is one-way and auto-accepts; it is not the same as a connection request

### Companies

- **`/companies`** — directory of verified employers, showing only companies that are both verified and active
- A company is created `pending` and unverified at signup. It stays off the public directory and cannot post jobs until an admin approves it
- Companies can submit documents for review; approving a business registration verifies the company and records who approved it and when

### Applications and hiring

- Talent applies to a job; the company reviews applications at `/company/applications`
- An application moves `pending` → `accepted` / `rejected`
- A company is capped at one job per month until verified; verified companies are uncapped

---

## Accounts

`/dashboard` routes each signed-in user by role:

| Role | Lands on | Sees |
| --- | --- | --- |
| Company | `/company/dashboard` | Post jobs, review applications, verification status |
| Talent | `/dashboard/talent` | Workspace, tasks, deadlines, applications |
| Admin | `/admin` | Back-office across talent, companies, jobs and users |

Admin access is env-only: `ADMIN_USER_IDS` holds Clerk user ids and no admin role is stored in the database.

---

## Public pages

`/` home, `/talents`, `/jobs`, `/companies`, `/challenges`, `/spotlight`, `/leaderboard`, `/portfolio`, `/feed`, `/profile`, `/skill-swap`, `/blog`, `/news`, `/careers`, `/intake`, plus the static pages.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **React** 18 client components
- **PostgreSQL** via **Prisma** (53 models)
- **Clerk** for authentication; `clerkId` on `User` maps a Clerk session to a database record
- Custom design system in `app/globals.css` — calm, editorial, premium
- Typography: Fraunces (serif display) + Inter (sans) + IBM Plex Mono

120 API routes, 91 pages.

---

## Getting started

```bash
npm install
npm run db:seed     # optional: realistic development data, idempotent
npm run dev
```

Visit `http://localhost:3000`. Signed-in users land on the dashboard for their role; everyone else on the home page.

`DATABASE_URL`, `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set in `.env`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Push schema, generate client, build |
| `npm run test` | Unit tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright) |
| `npm run db:push` | Sync the Prisma schema |
| `npm run db:seed` | Seed development data |
| `npm run lint` | Lint |

---

## Project structure

```
app/
  jobs/            Job board list + [id] listing, apply, report
  talents/         Talent directory + [id] public profile
  companies/       Public verified-employer directory
  company/         Company dashboard, jobs, applications, profile, verification
  dashboard/talent Talent workspace, tasks, deadlines, applications
  admin/           Back-office: talent, clients, companies, jobs + reports,
                   users, team, careers, conversations, blogs, news, settings
  api/             120 route handlers
  [public pages]   home, challenges, spotlight, leaderboard, portfolio,
                   feed, skill-swap, blog, news, careers, intake, …
components/app/     Header, Footer, AdminShell, DashboardShell, CompanyShell,
                    ClientShell, UI primitives, Page
lib/                ai, api-auth, auth, session, prisma, notifications,
                    email, errors, request, types, store
__tests__/          Unit tests
e2e/                Playwright specs
prisma/             schema.prisma, seed.ts
```

### Conventions

- **Admins live in the environment, not the database.** Compare `ADMIN_USER_IDS` against the Clerk session id, never a database id. `lib/api-auth.ts` exposes `isAdminUser` and `requireAdmin`.
- **Request bodies** go through `readJson` in `lib/request.ts` so malformed JSON returns 400 rather than an unhandled 500.
- **Session users** resolve with `getSessionUser()`, which looks up by `clerkId`. The Clerk session id is not a database id.
- **Approval gates visibility.** A company is only public when verified and active; a job is only public when approved.

---

## Design philosophy

- Strong typography, excellent whitespace, refined borders, subtle shadows.
- Verified employers and reviewed listings are visibly distinguished.
- No neon gradients, no glowing cards, no fake statistics — purposeful information hierarchy only.