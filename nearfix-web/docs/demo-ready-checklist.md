# NearFix Demo-Ready Checklist

This document operationalizes section 13 of TODO for quick pre-demo verification.

## 1) Seed Data Fresh and Realistic

Source seed file: `supabase/seed.sql`.

Coverage in seed script:

- 8 categories inserted.
- 20 workers inserted.
- 60 bookings inserted with mixed states.
- Realistic Indian names, service areas, and category-specific bios.
- 50+ review entries generated from completed bookings.

Pre-demo refresh step:

1. Run `supabase/seed.sql` against the target demo database.
2. Verify sample counts in SQL editor:

```sql
select count(*) as categories from public.categories;
select count(*) as workers from public.workers;
select count(*) as bookings from public.bookings;
select count(*) as reviews from public.reviews;
```

Expected minimums:

- categories: 8
- workers: >= 20
- bookings: >= 30
- reviews: >= 50

## 2) Demo Accounts Ready

Use one account per role and keep credentials in secure local env only.

Required roles:

- Customer account
- Worker account
- Admin account

Where to set for API/demo runs:

- `docs/postman/NearFix.postman_environment.json` values:
  - `customerEmail`, `customerPassword`
  - `workerEmail`, `workerPassword`
  - `adminEmail`, `adminPassword`

Canonical admin identity in seed profiles:

- `admin@nearfix.example.com` (application profile row)

## 3) Postman Collection and Environment Cleaned + Exported

Artifacts present:

- `docs/postman/NearFix.postman_collection.json`
- `docs/postman/NearFix.postman_environment.json`

Pre-demo hygiene:

1. Ensure temporary IDs/tokens are blank before export.
2. Keep only keys and placeholders in exported environment.
3. Do not export secrets in committed files.

## 4) README Completeness

`README.md` includes:

- Setup steps
- Architecture note
- Route map
- API testing steps
- Phase 2 feature list

## 5) Under-10-Minute Demo Script

Recommended order:

1. Customer logs in and creates booking.
2. Worker logs in, accepts booking, marks completed.
3. Customer adds review.
4. Admin verifies worker.

Time budget target:

- Step 1: 3 minutes
- Step 2: 3 minutes
- Step 3: 2 minutes
- Step 4: 2 minutes

Total: ~10 minutes.
