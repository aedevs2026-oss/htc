# HTC Furniture — Supabase, product catalogue, enquiries and dealers

## 1. Supabase configuration

1. Create a Supabase project.
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql`
   - `supabase/migrations/20261030_enquiries_dealers_catalog.sql`
3. Create a Storage bucket named `product-images` and set it to **Public** (the seed script can create it if your service-role key has storage permissions).
4. Create an Auth user for the first store administrator, then run the owner insert from `supabase/schema.sql` with that user's UUID.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill the values. Never expose `SUPABASE_SERVICE_ROLE_KEY` or SMTP credentials with a `NEXT_PUBLIC_` prefix.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

SMTP:
- `SMTP_HOST`
- `SMTP_PORT` (587 for STARTTLS, 465 for implicit TLS)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional; defaults to SMTP_USER)
- `ENQUIRY_TO_EMAIL` (inbox receiving website enquiries)

Storage:
- `SUPABASE_STORAGE_BUCKET=product-images` (optional; defaults to product-images)

## 3. Install and seed

```bash
npm install
npm install nodemailer
npm run seed:supabase
npm run dev
```

The seed command upserts all catalogue categories and products, uploads every referenced local product image into the public Storage bucket, and writes the resulting public image URLs into the product `image_path` and `images` JSON fields. It also seeds the room and brand lookup tables and the product-to-room / product-to-brand relationships. It is safe to rerun: rows are upserted by stable catalogue identifiers and storage uploads use upsert.

For production:
```bash
npm run build
npm run start
```

## 4. Image handling

The local catalogue remains the source of truth under `public/images/catalog`. The seed script copies those files into Supabase Storage. Keep the local files in the repository so a clean build can also render the catalogue before Supabase is configured.

## 5. Dealer data

The dealer table starts empty intentionally. Add only confirmed HTC-authorised locations with exact addresses, phone numbers, and map coordinates. Do not publish illustrative locations as real dealers. The public dealer finder reads active rows from `public.dealers`.

## 6. Enquiries

The contact and product enquiry forms post to `/api/enquiries`. Each submission is saved to `public.enquiries`. When SMTP environment variables are configured, an email notification is sent to `ENQUIRY_TO_EMAIL`; if SMTP is not configured, the enquiry is still saved and a warning is logged. Test with a real email inbox before production launch.
