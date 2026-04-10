# NearFix API Endpoints (MVP)

This document defines the API layer contract for Postman testing.

## Strategy Chosen

- Approach: Direct Supabase REST (PostgREST) + Supabase Auth endpoints.
- Why: Fastest path for MVP and matches current implementation.
- Base URL template:
  - Auth: `${SUPABASE_URL}/auth/v1`
  - Data: `${SUPABASE_URL}/rest/v1`

## Common Headers

Use these in Postman unless a request notes otherwise.

- `apikey: {{anonKey}}`
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
- `Prefer: return=representation` for insert/update requests when you need returned rows.

## Auth and Session

### 1) Signup

- Method: `POST`
- URL: `/auth/v1/signup`
- Auth: none (uses `apikey`)
- Request body:

```json
{
  "email": "worker.one@example.com",
  "password": "StrongPass123!",
  "data": {
    "full_name": "Worker One",
    "role": "worker"
  }
}
```

- Success response (example):

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "worker.one@example.com",
    "user_metadata": {
      "full_name": "Worker One",
      "role": "worker"
    }
  }
}
```

- Error response (example):

```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unable to validate request"
}
```

### 2) Login (password grant)

- Method: `POST`
- URL: `/auth/v1/token?grant_type=password`
- Auth: none (uses `apikey`)
- Request body:

```json
{
  "email": "worker.one@example.com",
  "password": "StrongPass123!"
}
```

- Success response: token payload with `access_token`, `refresh_token`, `user`.
- Error response: 400/401.

### 3) Current user

- Method: `GET`
- URL: `/auth/v1/user`
- Auth: bearer token required
- Success response: authenticated user profile from auth service.

### 4) Logout

- Method: `POST`
- URL: `/auth/v1/logout`
- Auth: bearer token required
- Success response: `204` or empty JSON.

## Users/Profile API

### 5) Upsert app profile row after signup/login

- Method: `POST`
- URL: `/rest/v1/users`
- Auth: bearer token required
- Notes: Insert is allowed for customer/worker via policy.
- Request body:

```json
{
  "auth_user_id": "auth-uuid",
  "name": "Worker One",
  "email": "worker.one@example.com",
  "role": "worker"
}
```

- Success response: inserted row (with `Prefer: return=representation`).
- Error response: `401/403` if token/role-policy fails.

### 6) Read own profile

- Method: `GET`
- URL: `/rest/v1/users?select=id,auth_user_id,name,email,role,is_active,created_at&auth_user_id=eq.{{authUserId}}`
- Auth: bearer token required

## Workers Discovery API

### 7) Worker list (sortable)

- Method: `GET`
- URL: `/rest/v1/workers?select=id,user_id,category,experience,bio,starting_price,service_area,verified,rating,jobs_completed,created_at&order=rating.desc`
- Auth: anon or bearer
- Variants:
  - Lowest price: `order=starting_price.asc`
  - Most experienced: `order=experience.desc`
  - Category filter: append `&category=eq.Electrician`

### 8) Worker detail

- Method: `GET`
- URL: `/rest/v1/workers?select=id,user_id,category,experience,bio,starting_price,service_area,verified,rating,jobs_completed,created_at&id=eq.{{workerId}}&limit=1`
- Auth: anon or bearer

### 9) Resolve worker name (from users)

- Method: `GET`
- URL: `/rest/v1/users?select=id,name,role&id=in.({{workerUserIdsCsv}})&role=eq.worker`
- Auth: anon or bearer
- Notes: used to display names for worker cards/profile.

## Slot API

### 10) List worker slots

- Method: `GET`
- URL: `/rest/v1/availability_slots?select=id,worker_id,date,start_time,end_time,is_booked&worker_id=eq.{{workerId}}&order=date.asc&order=start_time.asc`
- Auth: anon or bearer

### 11) Worker create slot

- Method: `POST`
- URL: `/rest/v1/availability_slots`
- Auth: worker token required
- Request body:

```json
{
  "worker_id": "{{workerId}}",
  "date": "2026-04-15",
  "start_time": "09:00",
  "end_time": "10:00",
  "is_booked": false
}
```

### 12) Worker update slot

- Method: `PATCH`
- URL: `/rest/v1/availability_slots?id=eq.{{slotId}}&worker_id=eq.{{workerId}}`
- Auth: worker token required
- Request body:

```json
{
  "date": "2026-04-15",
  "start_time": "10:00",
  "end_time": "11:00"
}
```

### 13) Worker delete slot (unbooked only)

- Method: `DELETE`
- URL: `/rest/v1/availability_slots?id=eq.{{slotId}}&worker_id=eq.{{workerId}}&is_booked=eq.false`
- Auth: worker token required

## Booking API

### 14) Customer create booking

- Method: `POST`
- URL: `/rest/v1/bookings`
- Auth: customer token required
- Request body:

```json
{
  "customer_id": "{{customerProfileId}}",
  "worker_id": "{{workerId}}",
  "slot_id": "{{slotId}}",
  "description": "AC not cooling",
  "status": "PENDING",
  "price": 799
}
```

### 15) Mark slot booked after booking create

- Method: `PATCH`
- URL: `/rest/v1/availability_slots?id=eq.{{slotId}}`
- Auth: customer token required
- Request body:

```json
{
  "is_booked": true
}
```

### 16) Customer list own bookings

- Method: `GET`
- URL: `/rest/v1/bookings?select=id,customer_id,worker_id,slot_id,description,status,price,created_at,updated_at&customer_id=eq.{{customerProfileId}}&order=created_at.desc`
- Auth: customer token required

### 17) Customer cancel booking

- Method: `PATCH`
- URL: `/rest/v1/bookings?id=eq.{{bookingId}}&status=in.(PENDING,CONFIRMED)`
- Auth: customer token required
- Request body:

```json
{
  "status": "CANCELLED"
}
```

### 18) Worker accept/reject pending booking

- Method: `PATCH`
- URL: `/rest/v1/bookings?id=eq.{{bookingId}}&worker_id=eq.{{workerId}}&status=eq.PENDING`
- Auth: worker token required
- Request body examples:

```json
{ "status": "CONFIRMED" }
```

```json
{ "status": "REJECTED" }
```

### 19) Worker complete confirmed booking

- Method: `PATCH`
- URL: `/rest/v1/bookings?id=eq.{{bookingId}}&worker_id=eq.{{workerId}}&status=eq.CONFIRMED`
- Auth: worker token required
- Request body:

```json
{ "status": "COMPLETED" }
```

## Review API

### 20) Create review (completed booking only)

- Method: `POST`
- URL: `/rest/v1/reviews`
- Auth: customer token required
- Request body:

```json
{
  "booking_id": "{{bookingId}}",
  "worker_id": "{{workerId}}",
  "customer_id": "{{customerProfileId}}",
  "rating": 5,
  "review": "On time and solved the issue quickly.",
  "punctuality": 5,
  "work_quality": 5,
  "behavior": 5
}
```

- Expected error if booking is not completed: `401/403` from policy.

### 21) List reviews by worker

- Method: `GET`
- URL: `/rest/v1/reviews?select=id,booking_id,customer_id,worker_id,rating,review,punctuality,work_quality,behavior,created_at&worker_id=eq.{{workerId}}&order=created_at.desc`
- Auth: customer/worker/admin token required

## Admin API

### 22) Users table for admin dashboard

- Method: `GET`
- URL: `/rest/v1/users?select=id,name,email,role,is_active,created_at&order=created_at.desc`
- Auth: admin token required

### 23) Workers table for admin dashboard

- Method: `GET`
- URL: `/rest/v1/workers?select=id,user_id,category,experience,verified,rating,jobs_completed,service_area&order=created_at.desc`
- Auth: admin token required

### 24) Bookings table for admin dashboard

- Method: `GET`
- URL: `/rest/v1/bookings?select=id,customer_id,worker_id,status,price,created_at&order=created_at.desc&limit=100`
- Auth: admin token required

### 25) Verify/unverify worker

- Method: `PATCH`
- URL: `/rest/v1/workers?id=eq.{{workerId}}`
- Auth: admin token required
- Request body examples:

```json
{ "verified": true }
```

```json
{ "verified": false }
```

### 26) Deactivate/activate user

- Method: `PATCH`
- URL: `/rest/v1/users?id=eq.{{userId}}`
- Auth: admin token required
- Request body examples:

```json
{ "is_active": false }
```

```json
{ "is_active": true }
```

### 27) Review moderation (delete)

- Method: `DELETE`
- URL: `/rest/v1/reviews?id=eq.{{reviewId}}`
- Auth: admin token required

## Standard Error Shapes to Assert in Postman

- Unauthorized/forbidden:

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```

- Invalid input/constraint:

```json
{
  "code": "23514",
  "message": "new row for relation violates check constraint"
}
```

- Duplicate key/unique violation:

```json
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint"
}
```

## Coverage Matrix (Step 9 Validation)

- Auth/session: endpoints 1, 2, 3, 4, 5, 6
- Workers list/detail/sort: endpoints 7, 8, 9
- Slot CRUD: endpoints 10, 11, 12, 13
- Booking create/update/status transitions: endpoints 14, 15, 16, 17, 18, 19
- Review create/list: endpoints 20, 21
- Admin verify/deactivate: endpoints 22, 23, 24, 25, 26, 27

This endpoint document is intentionally Postman-ready and matches the current app service layer behavior and policies.
