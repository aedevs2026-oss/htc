# HTC Furniture Admin Panel and Supabase setup

This branch adds a secure administrative layer and PostgreSQL schema to the existing Next.js 15 + React 19 site.

## Modules
- Supabase Auth login using `@supabase/ssr` cookie-managed access/refresh sessions.
- Server-side session verification using `auth.getUser()`.
- Explicit RBAC allow-list via `public.admin_users`.
- Dashboard metrics and latest audit events.
- Product listing/editor already present; added product create form and CRUD JSON APIs.
- Category editor and CRUD APIs.
- Homepage highlight settings persisted in Postgres `site_settings`.
- Business / SEO / social / storefront settings UI.
- Admin audit trail view.

## Supabase setup
1. Create a Supabase project.
2. Run all SQL in `supabase/schema.sql`.
3. Create an auth user in Supabase Authentication → Users.
4. Provision the first owner using that auth user's UUID:
   `insert into public.admin_users(user_id,role) values ('AUTH-USER-UUID','owner');`
5. Configure Vercel/local env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose with NEXT_PUBLIC_)
6. Run `npm run seed:supabase` to import `data/products.json` and `data/categories.json` in batches.

Supabase Auth stores/refreshes sessions through secure cookie handling in `@supabase/ssr`. The middleware's `auth.getUser()` verifies the current user and all admin server actions/API handlers independently check membership in `admin_users`. This intentionally avoids minting a second bespoke JWT: Supabase JWTs are already signed and validated by Supabase; duplicating that token would increase session complexity. Use HTTPS in production, configure MFA for admin accounts, and keep service-role credentials server-only.

## API routes
- `GET/POST /api/admin/products`
- `PATCH/DELETE /api/admin/products/:id`
- `GET/POST /api/admin/categories`
- `PATCH/DELETE /api/admin/categories/:slug`
- `GET /api/admin/dashboard`
- `GET/PUT /api/admin/settings`
- `GET /api/admin/audit`

## Important
The seed utility imports the repository's local JSON product/category catalogue into Supabase Postgres. Run it after setting env variables. This is a data import, not a pg_dump backup. Export a real PostgreSQL backup from Supabase after migration.

Never commit `.env.local`, Supabase service keys, user passwords, or session tokens. Admin API routes verify auth and admin allow-list server-side. Apply Supabase schema before enabling the panel.
