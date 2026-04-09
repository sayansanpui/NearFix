# PRD.md — Local Skilled Worker Booking Platform (Prototype MVP)

## 1) Product Overview

**Product Name:** Local Skilled Worker Booking Platform
**Positioning:** A prototype web marketplace for booking trusted local service workers such as electricians, plumbers, carpenters, AC repair technicians, and appliance mechanics.
**Goal:** Build a strong **resume-ready prototype MVP** that demonstrates product thinking, scalable architecture, real-world workflows, and marketplace system design.

This MVP must be optimized for:

- **Interview demos**
- **Product vision storytelling**
- **Clean system design discussion**
- **Free-tier friendly implementation**
- **Fast AI-agent execution with low ambiguity**

---

## 2) Product Vision

The product solves the real-world problem of finding **reliable local skilled workers quickly**.

### Core Problems

- Users cannot easily find trusted workers nearby
- No clear pricing transparency
- No structured booking flow
- No reviews or trust layer
- No worker availability visibility

### Vision

Create a **web-first prototype** that acts like a lightweight version of Urban Company focused on hyperlocal services.

---

## 3) MVP Goal

The MVP must prove these 5 core hypotheses:

1. Users can discover workers by category
2. Users can book a worker in a chosen time slot
3. Workers can manage availability
4. Reviews improve trust
5. Marketplace workflow is understandable in demo form

This is a **prototype**, so avoid overbuilding.

---

## 4) Explicit Scope Boundaries (Very Important)

To avoid AI hallucination, the implementation MUST stay inside this scope.

## ✅ MUST BUILD

- Authentication
- Role-based login (customer / worker / admin)
- Worker listing page
- Service categories
- Worker profile page
- Booking flow
- Time slot selection
- Booking history
- Ratings and reviews
- Worker dashboard
- Admin dashboard (basic)
- Responsive web UI

## ❌ DO NOT BUILD IN MVP

Skip these because they need paid/external complexity:

- Real payment gateway
- Live GPS tracking
- Real maps routing
- Real-time chat socket
- SMS OTP
- AI image issue detection
- Push notifications
- Voice calling
- Insurance/warranty engine

Mention these as **future vision features only**.

---

## 5) User Roles

### 5.1 Customer

Can:

- sign up / login
- browse services
- view worker details
- select slot
- book service
- cancel booking
- rate completed booking
- view booking history

### 5.2 Worker

Can:

- create professional profile
- choose skill category
- define service location text
- manage available slots
- accept / reject booking
- mark booking complete
- see ratings

### 5.3 Admin

Can:

- view all users
- view all workers
- approve worker verification badge manually
- view all bookings
- deactivate suspicious users

---

## 6) Core User Stories

## Customer Stories

- As a customer, I want to browse workers by service category
- As a customer, I want to see ratings before booking
- As a customer, I want to choose a convenient slot
- As a customer, I want transparent pricing estimate
- As a customer, I want booking history

## Worker Stories

- As a worker, I want to receive booking requests
- As a worker, I want to manage available hours
- As a worker, I want my rating to improve trust

## Admin Stories

- As an admin, I want to manage fake workers
- As an admin, I want platform-level visibility

---

## 7) MVP Feature Requirements

## 7.1 Authentication

Use **Clerk free tier** OR **Firebase Auth free tier**.

Preferred: **Firebase Auth** for simplicity.

### Requirements

- email/password login
- signup
- logout
- role saved in DB
- protected routes

---

## 7.2 Service Categories

Predefined categories only.

```json
[
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Repair",
  "RO Repair",
  "Home Cleaning",
  "Painter",
  "Appliance Repair"
]
```

UI requirement:

- category cards grid
- icon + title
- click navigates to worker listing

---

## 7.3 Worker Listing

Each worker card must show:

- profile image
- name
- category
- experience
- rating
- total jobs
- starting price
- availability today
- verified badge (admin-controlled)

### Sorting

Allow:

- highest rated
- lowest price
- most experienced

---

## 7.4 Worker Profile

Detailed profile page.

### Required sections

- worker photo
- bio
- skills
- years of experience
- pricing
- service area
- available slots
- ratings list
- completed jobs count

CTA button: **Book Now**

---

## 7.5 Booking Flow

### Step-by-step

1. customer selects worker
2. choose date
3. choose available time slot
4. add issue description
5. confirm booking
6. booking enters `PENDING`
7. worker accepts → `CONFIRMED`
8. after completion → `COMPLETED`

### Booking Status Enum

```ts
PENDING | CONFIRMED | REJECTED | COMPLETED | CANCELLED;
```

---

## 7.6 Reviews

After completion only.

Fields:

- rating (1–5)
- review text
- punctuality
- work quality
- behavior

Display:

- average rating
- latest reviews

---

## 7.7 Worker Dashboard

Sections:

- today bookings
- pending requests
- completed jobs
- earnings (mock only)
- rating summary
- slot management

**Important:** Earnings are simulated only.

---

## 7.8 Admin Dashboard

Minimal but impressive.

Pages:

- users table
- workers table
- bookings table
- verification approvals
- review moderation

This is great for interview demos.

---

## 8) Tech Stack (Free-Only Prototype)

This section is critical for AI agents.

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- React Query
- React Hook Form
- Zod

## Backend (Best Free Choice)

### Recommended: Supabase

Use **Supabase free tier** for:

- PostgreSQL DB
- Auth
- Storage
- Row-level security

This reduces backend coding complexity.

### If separate backend needed

- Node.js
- Express
- Prisma
- PostgreSQL (Neon free tier)

### Strong recommendation

For prototype speed, choose:

> **React + Supabase only**

This is ideal for AI-agent implementation.

---

## 9) Database Schema

## users

```sql
id uuid pk
name text
email text unique
role text
created_at timestamp
```

## workers

```sql
id uuid pk
user_id uuid fk
category text
experience int
bio text
starting_price decimal
service_area text
verified boolean
rating decimal
jobs_completed int
```

## availability_slots

```sql
id uuid pk
worker_id uuid fk
date date
start_time text
end_time text
is_booked boolean
```

## bookings

```sql
id uuid pk
customer_id uuid fk
worker_id uuid fk
slot_id uuid fk
description text
status text
price decimal
created_at timestamp
```

## reviews

```sql
id uuid pk
booking_id uuid fk
worker_id uuid fk
customer_id uuid fk
rating int
review text
created_at timestamp
```

---

## 10) App Routes

```txt
/
/login
/signup
/categories
/workers
/workers/:id
/book/:workerId
/my-bookings
/worker/dashboard
/admin/dashboard
```

---

## 11) UX Flow

### Customer

Home → Categories → Worker List → Worker Profile → Book Slot → My Bookings → Review

### Worker

Login → Worker Dashboard → Accept Request → Complete Job

### Admin

Login → Admin Dashboard → Verify Worker

---

## 12) Design System Guidelines

The UI must feel **premium and startup-ready**.

### Style Rules

- modern white clean layout
- rounded 2xl cards
- soft shadows
- blue accent CTA
- mobile responsive
- sticky top nav
- dashboard sidebar

### Important pages to look polished

- landing page
- worker listing
- booking confirmation
- dashboards

These pages matter most in interviews.

---

## 13) Landing Page Requirements

Must clearly sell the startup idea.

### Sections

- Hero section
- category shortcuts
- how it works
- top rated workers
- why trust us
- CTA signup

### Hero Headline

> Book Trusted Local Skilled Workers in Minutes

Subheadline:

> Electricians, plumbers, carpenters, and home repair experts near you.

---

## 14) Demo Data Requirement

AI agent MUST seed realistic fake data.

At least:

- 20 workers
- 8 categories
- 50 reviews
- 30 bookings

Use Indian names and local service examples for realism.

---

## 15) Future Vision Features (Do Not Build Now)

These should be shown in README / presentation.

- live location tracking
- in-app chat
- AI price estimation from uploaded image
- subscription maintenance plans
- UPI payment gateway
- SOS support
- warranty engine
- multilingual Bengali/Hindi support

Mention clearly:

> Reserved for Phase 2 due to free-tier limitations.

---

## 16) Non-Functional Requirements

- responsive web app
- load within 2 seconds on localhost
- reusable components
- scalable folder structure
- proper TypeScript types
- zero hardcoded role logic in UI
- use enums/constants

---

## 17) Suggested Folder Structure

```txt
src/
 ├── components/
 ├── pages/
 ├── layouts/
 ├── features/
 │   ├── auth/
 │   ├── workers/
 │   ├── bookings/
 │   └── reviews/
 ├── services/
 ├── hooks/
 ├── types/
 ├── lib/
 └── routes/
```

---

## 18) AI Agent Build Instructions (Strict)

This section prevents hallucination.

### MUST FOLLOW

- Build only MVP features listed above
- Prefer Supabase over custom backend
- Use mock payment fields only
- Use fake location text instead of maps
- Use seeded mock workers
- Use protected role routes
- Use reusable modal + form components
- Keep code production-style

### MUST NOT ASSUME

- no paid APIs
- no Google Maps
- no Twilio
- no Razorpay
- no AWS
- no Redis

If any feature requires paid service:

> skip implementation and mark as `Phase 2 Placeholder`

---

## 19) Resume Positioning

This project should be presented as:

> Designed and developed a scalable prototype of a hyperlocal skilled worker booking marketplace with role-based dashboards, booking workflow, review engine, and marketplace architecture using React + Supabase.

This wording is highly attractive to interviewers.

---

## 20) Success Criteria

MVP is successful if demo shows:

- customer books a worker
- worker accepts request
- booking completes
- customer leaves review
- admin verifies worker

This end-to-end workflow is enough for strong resume impact.
