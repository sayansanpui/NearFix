# TODO.md - NearFix MVP Step-by-Step Build + Validation Checklist

## 0) How to use this file

- Complete tasks in order.
- Do not skip validation checkpoints.
- Mark each checkbox when done.
- If a step fails validation, fix it before moving forward.

---

## 1) Project Initialization (React + Vite + TypeScript)

### 1.1 Create frontend app

- [x] Run:

```bash
npm create vite@latest nearfix-web -- --template react-ts
cd nearfix-web
npm install
```

- [x] Create first commit: `chore: bootstrap vite react-ts app`

Validation:

- [x] `npm run dev` starts without errors.
- [x] App opens at `http://localhost:5173` (or next free port if 5173 is already occupied).
- [x] Default Vite page is visible.

### 1.2 Install core dependencies

- [x] Run:

```bash
npm install react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers @supabase/supabase-js clsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Validation:

- [x] `package.json` contains all dependencies.
- [x] `npm run dev` still works.

### 1.3 Configure Tailwind

- [x] Update `tailwind.config.*` content paths.
- [x] Add Tailwind directives in global CSS.
- [x] Replace starter UI with one Tailwind-styled page.

Validation:

- [x] Utility classes (e.g., `bg-blue-600`) visually apply.

---

## 2) Supabase Setup (Backend on Free Tier)

### 2.1 Create Supabase project

- [ ] Create project in Supabase dashboard. (External manual step)
- [ ] Save:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin scripts only)

Validation:

- [ ] Project status is active.

Note:

- Local PostgreSQL validation is complete using your `postgres` account on `localhost`.
- The Supabase dashboard project still needs to be created manually before the hosted URL and anon key can be filled in.

### 2.2 Connect app to Supabase

- [x] Add `.env.local`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- [x] Create `src/lib/supabase.ts` client.

Validation:

- [x] App builds with no env errors.
- [x] A test query from client returns data or expected auth error (not config error).

### 2.3 Create database schema

- [x] Add SQL migration for tables:
  - `users`
  - `workers`
  - `availability_slots`
  - `bookings`
  - `reviews`
- [x] Add enums/constants for booking status:
  - `PENDING | CONFIRMED | REJECTED | COMPLETED | CANCELLED`

Validation:

- [x] Tables exist in Supabase Table Editor or validated in the local PostgreSQL mirror.
- [x] Foreign keys are correctly linked.

### 2.4 Set RLS and policies

- [x] Enable Row Level Security on all tables.
- [x] Add policies for:
  - customer read/write own bookings/reviews
  - worker read/update own profile/slots/booking actions
  - admin broad read + moderation actions

Validation:

- [x] Unauthenticated requests are blocked.
- [x] Customer cannot update another customer booking.
- [x] Worker cannot modify other worker slots.

---

## 3) Seed Realistic Demo Data

### 3.1 Seed baseline data

- [x] Insert 8 categories (fixed list from PRD).
- [x] Insert at least:
  - 20 workers
  - 50 reviews
  - 30 bookings
- [x] Use realistic Indian names and service-area text.

Validation:

- [x] Worker listing has enough records for sort/filter demos.
- [x] Ratings and completed jobs are non-zero for many workers.

### 3.2 Verify data quality

- [x] Ensure no broken FK references.
- [x] Ensure slots align with worker IDs.

Validation:

- [x] SQL checks return 0 orphan rows.

---

## 4) App Foundation and Architecture

### 4.1 Create folder structure

- [ ] Use structure:

```txt
src/
  components/
  pages/
  layouts/
  features/
    auth/
    workers/
    bookings/
    reviews/
  services/
  hooks/
  types/
  lib/
  routes/
```

Validation:

- [ ] Structure matches PRD.

### 4.2 Add shared types/constants

- [ ] Define TypeScript types for all entities.
- [ ] Add `BookingStatus` enum/union in one place.
- [ ] Add category constants from PRD in one file.

Validation:

- [ ] No hardcoded status/category strings scattered in components.

### 4.3 Routing skeleton

- [ ] Add routes:
  - `/`
  - `/login`
  - `/signup`
  - `/categories`
  - `/workers`
  - `/workers/:id`
  - `/book/:workerId`
  - `/my-bookings`
  - `/worker/dashboard`
  - `/admin/dashboard`

Validation:

- [ ] Every route renders a page without runtime crash.

---

## 5) Authentication + Role-Based Access

### 5.1 Build auth pages

- [ ] Signup, login, logout using Supabase Auth.
- [ ] Create/maintain role in DB profile (`customer`/`worker`/`admin`).

Validation:

- [ ] User can sign up, log in, log out.
- [ ] Session persists after refresh.

### 5.2 Protected routes

- [ ] Add route guard component.
- [ ] Restrict worker/admin routes by role.

Validation:

- [ ] Customer opening worker/admin routes gets redirected/blocked.
- [ ] Worker can open worker dashboard only.

---

## 6) Customer Experience Flow

### 6.1 Landing page

- [ ] Build polished sections:
  - Hero
  - Category shortcuts
  - How it works
  - Top rated workers
  - Trust section
  - CTA

Validation:

- [ ] Mobile + desktop responsive.
- [ ] Lighthouse performance acceptable for prototype.

### 6.2 Category page

- [ ] Show card grid with icon + title.
- [ ] Category click navigates to worker listing.

Validation:

- [ ] All 8 categories visible and clickable.

### 6.3 Worker listing page

- [ ] Worker card shows:
  - image, name, category, experience, rating
  - total jobs, starting price, availability today
  - verified badge
- [ ] Add sorting:
  - highest rated
  - lowest price
  - most experienced

Validation:

- [ ] Sorting changes ordering correctly.

### 6.4 Worker profile page

- [ ] Show required sections:
  - photo, bio, skills, experience, pricing
  - service area, available slots, ratings list, completed jobs
- [ ] Add `Book Now` CTA.

Validation:

- [ ] Worker profile loads from live DB data.

### 6.5 Booking flow page

- [ ] Steps:
  1. choose date
  2. choose slot
  3. issue description
  4. confirm
- [ ] Create booking with initial status `PENDING`.

Validation:

- [ ] Booking record is inserted.
- [ ] Slot is marked booked.
- [ ] Customer sees booking in `My Bookings`.

### 6.6 My bookings page

- [ ] Show bookings with status badges.
- [ ] Allow cancel for allowed statuses.

Validation:

- [ ] Cancel updates status to `CANCELLED`.

### 6.7 Review submission

- [ ] Allow review only for `COMPLETED` booking.
- [ ] Fields:
  - rating (1-5)
  - text
  - punctuality
  - work quality
  - behavior

Validation:

- [ ] Review is blocked before completion.
- [ ] Review appears in worker profile and updates average rating.

---

## 7) Worker Dashboard

### 7.1 Dashboard sections

- [ ] Today bookings
- [ ] Pending requests
- [ ] Completed jobs
- [ ] Earnings (mock/simulated)
- [ ] Rating summary
- [ ] Slot management

Validation:

- [ ] Pending booking can be accepted/rejected.
- [ ] Accepted booking status becomes `CONFIRMED`.
- [ ] Worker can mark confirmed booking as `COMPLETED`.

### 7.2 Slot management

- [ ] Worker creates, edits, removes availability slots.

Validation:

- [ ] Newly created slot appears in customer booking flow.

---

## 8) Admin Dashboard (Basic but Demo-Strong)

### 8.1 Admin pages/tables

- [ ] Users table
- [ ] Workers table
- [ ] Bookings table
- [ ] Verification approval actions
- [ ] Review moderation actions

Validation:

- [ ] Admin can toggle worker verified badge.
- [ ] Admin can deactivate suspicious user.
- [ ] Non-admin cannot access dashboard.

---

## 9) API Layer Strategy (for clean Postman testing)

Use one of these approaches:

- Preferred for easier API testing: Supabase Edge Functions as REST endpoints.
- Alternative: Direct Supabase REST endpoints (PostgREST) with table-level endpoints.

Checklist:

- [ ] Create API endpoint list document (`docs/api-endpoints.md`) including method, URL, auth, request body, success/error response.
- [ ] Ensure every major workflow has API support:
  - auth/session
  - workers list/detail/sort
  - slot CRUD
  - booking create/update/status transitions
  - review create/list
  - admin verify/deactivate

Validation:

- [ ] Endpoint doc is complete and matches implementation.

---

## 10) Postman MCP Testing Plan (Test all APIs)

## 10.1 Setup Postman artifacts

- [ ] Create Postman workspace for NearFix.
- [ ] Create environment variables:
  - `baseUrl`
  - `anonKey` (if using Supabase REST)
  - `customerToken`
  - `workerToken`
  - `adminToken`
  - `workerId`, `slotId`, `bookingId`

Validation:

- [ ] Environment is selectable and variables resolve.

## 10.2 Create collection structure

- [ ] Folder: Auth
- [ ] Folder: Workers
- [ ] Folder: Slots
- [ ] Folder: Bookings
- [ ] Folder: Reviews
- [ ] Folder: Admin

Validation:

- [ ] Each folder contains at least one request.

## 10.3 Add pre-request scripts where needed

- [ ] Generate dynamic values (timestamps, random text).
- [ ] Set auth headers from environment variables.

Validation:

- [ ] Requests are sent with correct headers/body.

## 10.4 Add post-response tests for every request

For each request, verify at least:

- [ ] status code
- [ ] response shape
- [ ] critical field values
- [ ] response time threshold (prototype target)

Validation:

- [ ] Test tab shows all assertions passing.

## 10.5 End-to-end API scenario tests

Create chained flow tests:

- [ ] Customer login -> save token
- [ ] List workers -> pick worker
- [ ] Get slots -> pick slot
- [ ] Create booking -> save `bookingId`
- [ ] Worker accepts -> status `CONFIRMED`
- [ ] Worker completes -> status `COMPLETED`
- [ ] Customer posts review -> success
- [ ] Admin verifies worker -> verified true

Validation:

- [ ] Full chain passes in collection runner.
- [ ] DB reflects expected final state.

## 10.6 Negative and authorization tests

- [ ] Invalid token -> `401/403`
- [ ] Customer trying admin action -> blocked
- [ ] Worker trying to modify other worker slot -> blocked
- [ ] Review before completion -> blocked

Validation:

- [ ] API returns expected error code and message.

## 10.7 Regression run

- [ ] Run full collection after major changes.
- [ ] Export run report JSON.

Validation:

- [ ] 0 failing tests before demo.

## 10.8 Postman MCP execution order (when using MCP tools)

- [ ] Call `mcp_com_postman_p_getCodeGenerationInstructions` first.
- [ ] Identify workspace/user context:
  - `mcp_com_postman_p_getAuthenticatedUser`
  - workspace/environment tools as needed
- [ ] Create or open workspace, collection, and environment.
- [ ] Add requests folder-by-folder (Auth -> Workers -> Slots -> Bookings -> Reviews -> Admin).
- [ ] Add pre-request scripts for dynamic variables/token injection.
- [ ] Add post-response tests (`pm.test`, `pm.expect`) for each request.
- [ ] Send each request and confirm assertions pass.
- [ ] Run end-to-end chain and save generated IDs/tokens in environment variables.

Validation:

- [ ] MCP flow can be repeated from a clean environment with consistent passing results.

---

## 11) Feature-by-Feature Acceptance Matrix

For each feature below, run UI + API checks:

- [ ] Auth
- [ ] Category discovery
- [ ] Worker listing + sorting
- [ ] Worker profile
- [ ] Booking create/cancel
- [ ] Worker accept/reject/complete
- [ ] Reviews
- [ ] Admin verify/deactivate

Validation:

- [ ] Every feature has at least 1 happy-path and 1 negative-path test.

---

## 12) Non-Functional Checks

### 12.1 Performance

- [ ] Home and workers page load quickly on localhost.

Validation:

- [ ] Typical pages load in around 2 seconds or better on local machine.

### 12.2 Responsiveness

- [ ] Test mobile, tablet, desktop breakpoints.

Validation:

- [ ] No overflow/cutoff on key pages.

### 12.3 Type safety

- [ ] Run TypeScript checks.

Validation:

- [ ] No type errors.

### 12.4 Code quality

- [ ] Reusable components for cards, forms, status badges, modals.

Validation:

- [ ] No major duplicated UI logic.

---

## 13) Demo-Ready Checklist

- [ ] Seed data fresh and realistic.
- [ ] Demo accounts ready:
  - customer
  - worker
  - admin
- [ ] Postman collection and environment cleaned and exported.
- [ ] README includes:
  - setup steps
  - architecture note
  - route map
  - API testing steps
  - Phase 2 feature list

Validation:

- [ ] You can demo complete flow in under 10 minutes:
  1. Customer books
  2. Worker accepts and completes
  3. Customer reviews
  4. Admin verifies worker

---

## 14) Strict Scope Guard (Do not build now)

Do not implement in MVP:

- real payment gateway
- live GPS/maps routing
- sockets/live chat
- SMS OTP
- push notifications
- voice calling
- insurance/warranty engine

If asked during build:

- mark as `Phase 2 Placeholder` and continue MVP.

---

## 15) Suggested Execution Order (Quick Index)

- [ ] Week 1: Setup + DB + Auth + Routing
- [ ] Week 2: Worker discovery + profile + booking
- [ ] Week 3: Worker/admin dashboards + reviews
- [ ] Week 4: Postman MCP full API test suite + polish + demo prep

Validation:

- [ ] End of each week: run collection regression + manual UI smoke test.
