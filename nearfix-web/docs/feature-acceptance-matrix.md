# NearFix Feature-by-Feature Acceptance Matrix

This matrix covers section 11 of TODO and defines at least one happy-path and one negative-path test for each core feature, with both UI and API checks.

## 1. Auth

- UI happy: User logs in with valid credentials from Login page and lands on role-appropriate route.
- UI negative: User enters invalid credentials and sees error feedback without session creation.
- API happy: `POST /auth/v1/token?grant_type=password` with valid email/password returns 200 and access token.
- API negative: `POST /auth/v1/token?grant_type=password` with wrong password returns auth failure (400/401).

## 2. Category Discovery

- UI happy: Categories page renders all 8 categories and category click navigates to worker listing with category context.
- UI negative: Unknown category query/path shows empty state and no crash.
- API happy: `GET /rest/v1/workers?select=...&order=rating.desc` returns worker list for discovery view.
- API negative: Request with invalid/expired bearer token is rejected (401/403).

## 3. Worker Listing + Sorting

- UI happy: Workers page renders cards and sorting by rating/price/experience changes order.
- UI negative: Empty result condition renders proper fallback state (no broken cards).
- API happy: Worker list endpoint returns array with expected fields used by cards.
- API negative: Invalid filter/token request fails with expected error response.

## 4. Worker Profile

- UI happy: Worker details page shows bio, pricing, service area, slots, reviews, and Book Now CTA.
- UI negative: Invalid worker id route shows not-found/error state without runtime crash.
- API happy: `GET /rest/v1/workers?...&id=eq.{workerId}` returns one worker row.
- API negative: Non-readable worker/profile request with invalid auth returns 401/403.

## 5. Booking Create/Cancel

- UI happy: Customer completes booking flow and booking appears in My Bookings with PENDING status.
- UI negative: Attempt to book unavailable/invalid slot is blocked with error feedback.
- API happy: `POST /rest/v1/bookings` creates booking and stores `bookingId`; cancel path updates status to CANCELLED.
- API negative: Customer cannot cancel another customer booking due to RLS (401/403).

## 6. Worker Accept/Reject/Complete

- UI happy: Worker dashboard can accept/reject pending requests and complete confirmed jobs.
- UI negative: Worker cannot transition booking not owned by them.
- API happy: `PATCH /rest/v1/bookings?...worker_id=eq.{workerId}` transitions PENDING->CONFIRMED->COMPLETED.
- API negative: Worker token updating foreign booking/invalid transition is blocked (401/403 or no rows updated).

## 7. Reviews

- UI happy: Customer submits review for completed booking and review appears on worker profile.
- UI negative: Review submission before completion is blocked.
- API happy: `POST /rest/v1/reviews` with completed booking succeeds and stores review.
- API negative: Review for incomplete/invalid booking is rejected (401/403/409 by policy/constraints).

## 8. Admin Verify/Deactivate

- UI happy: Admin dashboard can verify worker and deactivate suspicious user.
- UI negative: Non-admin user is blocked from admin dashboard/actions.
- API happy: Admin token can patch worker `verified=true` and update user `is_active=false`.
- API negative: Customer/worker token attempting admin patch is rejected (401/403).

## Evidence Mapping

- Collection coverage is in `docs/postman/NearFix.postman_collection.json` folders: Auth, Workers, Slots, Bookings, Reviews, Admin, Negative.
- Endpoint contracts are in `docs/api-endpoints.md`.
- UI implementation coverage exists in pages/routes and role-guarded flows implemented in earlier steps.
