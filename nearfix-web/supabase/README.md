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

## Supabase dashboard steps

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run `schema.sql`.
4. Confirm the tables exist.
5. Confirm RLS is enabled on all tables.

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
