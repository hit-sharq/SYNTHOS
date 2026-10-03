# Synthos — Creative Intelligence & Project Automation Platform

**Synthos** is the operating system for creative intelligence. It helps creative teams and agencies turn client conversations and creative briefs into structured project intelligence, strategic direction, proposals, quotes, and human-approved deliverables.

The platform is built on a single principle:

> **AI assists. Humans decide.**

AI accelerates the work — understanding requirements, analysing briefs, processing transcripts, synthesising insight, drafting proposals and quotes. Humans remain responsible for reviewing, editing, making strategic decisions, and approving before anything reaches a client.

---

## The workflow

Every project moves through a connected, ten-stage workflow:

1. **Creative Brief** — capture client objectives, audience, direction and constraints.
2. **Client Call** — schedule and run the discovery conversation.
3. **Meeting Transcript** — an intelligent workspace that extracts meaning, decisions and action items.
4. **AI Understanding** — raw information becomes structured intelligence (wants, objectives, constraints, risks, missing info, questions).
5. **Structured Project Brief** — a refined brief combining every source.
6. **Creative Intelligence Workshop** — humans and AI build the strategic direction together.
7. **AI Synthesis** — all intelligence combined into clear direction.
8. **Proposal** — a professional, AI-drafted, human-approved proposal.
9. **Quote** — a professional quote, ready for review.
10. **Human Approval** — the final gate where humans decide.

An intake submitted from the public form can jump straight to a drafted proposal. When the intake analysis scores below the confidence floor (70), the proposal is held in draft and a human sends it explicitly.

---

## Areas

The app is split into distinct areas. Admin covers workflow and back-office; dashboards are role-specific.

### Workflow and back-office — `/admin`

Admin is gated by the `ADMIN_USER_IDS` environment variable, which holds Clerk user ids. There is no admin role in the database.

| Section | Purpose |
| --- | --- |
| **Workflow** group | `/admin/workflow/*` — Overview, Pipeline, Projects, Blueprints, Sessions, Offers, Estimates, Approvals, Messages |
| **Administration** group | `/admin/*` — Audit Logs, Projects, Talent, Clients, Companies, Job Postings, Job Reports, Users, Team, Careers, Conversations, Blogs, News, Contact Reports, Settings |

### Dashboards, by role

`/dashboard` routes each signed-in user to the right place:

- **Admin** → `/admin/workflow/overview`
- **Company** (a user with a `companyId`) → `/company/dashboard` — post jobs, review applications
- **Client** (no company) → `/client/dashboard` — track projects, review proposals and quotes
- **Talent** → `/dashboard/talent` — workspace, tasks, deadlines, applications

### Public

`/` home, `/talents`, `/jobs`, `/companies`, `/blog`, `/news`, `/careers`, `/challenges`, `/spotlight`, `/leaderboard`, `/skill-swap`, `/portfolio`, `/intake`, plus the static pages.

### Data model

`Company` is the business. `Client` is the contact person at that company, linked by `Client.companyId`. `Project` points at both: `companyId` for the business, `clientId` for the contact. `Talent` carries a `userId`, so a talent is a user with a profile.

Companies are created `pending` and unverified. They stay off the public directory and cannot post jobs until verified. A company can submit documents for review, and an admin approval records who verified it and when.

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

The application connects to PostgreSQL via Prisma. `DATABASE_URL`, `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set in `.env`.

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
  admin/
    workflow/       Overview, Pipeline, Projects, Briefs, Meetings,
                    Proposals, Quotes, Approvals, Intelligence,
                    Workshops, Messages
    [back-office]   Talent, Clients, Companies, Jobs + Reports, Users,
                    Team, Careers, Conversations, Blogs, News, Settings
  dashboard/talent/ Talent workspace, tasks, deadlines, applications
  company/          Company dashboard, jobs, applications, profile,
                    verification
  client/           Client project dashboard
  api/              120 route handlers
  [public pages]    talents, jobs, companies, blog, news, careers, …
components/app/     Header, Footer, AdminShell, DashboardShell, CompanyShell,
                    ClientShell, UI primitives, Page
lib/                ai, auto-workflow, api-auth, auth, session, prisma,
                    notifications, email, errors, request, types, store
__tests__/          Unit tests
e2e/                Playwright specs
prisma/             schema.prisma, seed.ts
```

### Conventions

- **Admins live in the environment, not the database.** Compare `ADMIN_USER_IDS` against the Clerk session id, never a database id. `lib/api-auth.ts` exposes `isAdminUser` and `requireAdmin` for this.
- **Request bodies** go through `readJson` in `lib/request.ts` so malformed JSON returns 400 rather than an unhandled 500.
- **Route handlers** resolve the session user with `getSessionUser()`, which looks up by `clerkId`. The Clerk session id is not a database id.

---

## Design philosophy

- Strong typography, excellent whitespace, refined borders, subtle shadows.
- Clear **AI vs Human** distinction throughout (slate-blue for AI, grounded green for human).
- No neon gradients, no glowing cards, no fake statistics — purposeful information hierarchy only.