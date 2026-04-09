# Supabase Setup

## Files

- `schema.sql`: Supabase schema with RLS policies.
- `local-schema.sql`: PostgreSQL-compatible schema for local validation.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 2.1 Create Supabase project (manual)

1. Go to `https://supabase.com/dashboard` and create a new project.
2. Fill project settings:
   - Organization: your personal org/team org
   - Project name: `nearfix`
   - Database password: strong password (save it)
   - Region: nearest to your users (for India, choose nearest APAC region)
3. Wait until project status is `ACTIVE`.
4. Open `Project Settings -> Data API` and copy:
   - `Project URL` -> use as `VITE_SUPABASE_URL`
   - `anon public` key -> use as `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` key -> keep for admin scripts only (never expose to frontend)
5. Add frontend keys in `.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

6. Quick validation:
   - URL format starts with `https://` and contains `.supabase.co`
   - anon key is non-empty
   - app starts without env errors (`npm run dev`)

## Apply schema in hosted Supabase

1. Open `SQL Editor` in Supabase dashboard.
2. Run `schema.sql`.
3. Confirm tables in `Table Editor`.
4. Confirm RLS enabled for all core tables.

## Local PostgreSQL validation

If you want to validate the schema locally, run `local-schema.sql` against your local PostgreSQL instance.

Example:

```bash
export PGPASSWORD='USER@1234'
psql -h localhost -U postgres -d nearfix -f supabase/local-schema.sql
```

If the database does not exist yet, create it first:

```bash
export PGPASSWORD='USER@1234'
createdb -h localhost -U postgres nearfix
```
