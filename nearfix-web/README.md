# NearFix MVP

NearFix is a local skilled-worker booking platform MVP built with React, TypeScript, Vite, and Supabase.

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Configure environment in `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start development server:

```bash
npm run dev
```

4. Build for production validation:

```bash
npm run build
```

## Architecture Note

- Frontend: React + TypeScript + Vite + Tailwind.
- Routing: React Router with role-aware protected routes.
- Backend: Supabase Auth + PostgREST + RLS policies.
- Roles: `customer`, `worker`, `admin`.
- Core entities: `users`, `workers`, `availability_slots`, `bookings`, `reviews`.

## Route Map

- Public:
  - `/`
  - `/login`
  - `/signup`
  - `/categories`
  - `/workers`
  - `/workers/:id`
- Customer-only:
  - `/book/:workerId`
  - `/my-bookings`
- Worker-only:
  - `/worker/dashboard`
- Admin-only:
  - `/admin/dashboard`

## API Testing Steps

1. Import Postman files from `docs/postman/`:
   - `NearFix.postman_collection.json`
   - `NearFix.postman_environment.json`
2. Fill environment variables (`baseUrl`, `anonKey`, demo account credentials).
3. Run collection in this order:
   - Auth -> Workers -> Slots -> Bookings -> Reviews -> Admin -> Negative
4. Confirm assertions in Postman test results.
5. Export run report JSON to `docs/postman/reports/latest-run.json`.

Detailed Postman run guidance: `docs/postman/README.md`.

## Demo-Ready References

- API contracts: `docs/api-endpoints.md`
- Feature acceptance matrix: `docs/feature-acceptance-matrix.md`
- Non-functional checks: `docs/non-functional-checks.md`
- Demo runbook and accounts prep: `docs/demo-ready-checklist.md`

## Phase 2 Feature List (Out of MVP Scope)

- Real payment gateway
- Live GPS/maps routing
- Sockets/live chat
- SMS OTP
- Push notifications
- Voice calling
- Insurance/warranty engine
