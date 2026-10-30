# HTC Furniture Admin Panel + Supabase

## Included modules
- Admin sign-in via Supabase Auth (server-verified user session and secure cookie refresh)
- RBAC allow-list in `admin_users`
- Dashboard metrics and activity log
- Products CRUD API, price/stock/publish/feature flags, description, categories, image gallery JSON
- Categories CRUD API
- Homepage/store settings key-value API
- Admin audit trail
- Existing admin UI: products, categories, homepage highlights, catalogue sync

## Secure setup
1. Create a Supabase project (PostgreSQL).
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Create a user in Supabase Authentication → Users (email/password; enable MFA in production).
4. Copy the user's UUID and provision them as the first owner:
   `insert into public.admin_users(user_id,role) values ('AUTH-USER-UUID','owner');`
5. Set environment variables locally and in Vercel. Do not commit .env files:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. Run `npm run seed:supabase` to import the local JSON dump into Postgres.

Supabase Auth uses access/refresh tokens managed in secure HttpOnly cookies via `@supabase/ssr`. The middleware calls `auth.getUser()` to validate the session; it does not trust an unverified JWT from localStorage. API routes re-check the authenticated user and the admin allow-list on every write. This is preferable to issuing a second app JWT, which would duplicate the session system.

## Import / dump
The seed utility imports `data/products.json` and `data/categories.json` in batches. The product dump in the repo is the source snapshot, not a database backup; export a pg_dump from Supabase after live migration for a full database backup.

## Go live checklist
- Add all authorised admins to `admin_users`.
- Keep RLS enabled; never use service role from browser/client code.
- Enforce MFA for owner/admin accounts in Supabase Auth.
- Configure SMTP, password reset URL and allowed redirect URLs.
- Rotate keys if accidentally disclosed.
- Verify DB backups and retention policies.
