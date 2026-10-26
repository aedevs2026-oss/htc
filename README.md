# HTC Furniture — Next.js Website (2026)

A responsive multi-page Next.js + Tailwind CSS v4 website starter for HTC Furniture.

## Pages
- `/` — Home
- `/furniture` — Furniture catalogue
- `/rooms` — Shop by room
- `/collections` — Collections and sample global brand area
- `/dealers` — Dealer network / find a dealer
- `/about` — About HTC
- `/contact` — Contact and enquiry form

## Stack
- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS v4 configured through PostCSS
- Lucide React icons
- Local WebP image assets and SVG brand/icon assets
- No inline CSS or React `style` props; styling is in `app/globals.css` and utility classes can be added to components.

## Start locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Build
```bash
npm run build
npm start
```

## Assets
- `public/images/*.webp`: 16 locally generated/cropped premium interior and product image assets.
- `public/brand/htc-logo.svg`: editable SVG-inspired HTC logo.
- `public/icons/*.svg`: lightweight outline SVG icons.

The WebP images were exported from a generated 4×4 furniture photography moodboard. They are usable local starter assets, but review each crop and replace with approved, separately licensed/generated product photographs before production.

## Important before production
1. Replace the sample/placeholder global brand wordmarks with official partner-approved logo assets.
2. Verify all dealer locations, dealer counts, phone/email, address, business hours, testimonials, product names and policies. Current sample data is not verified.
3. Connect the contact/newsletter forms to an API, CRM or email service. The current forms are UI/demo forms only.
4. Implement real search/filter state, product details, wishlist, dealer location data, map integration and enquiry routing as needed.
5. Check the image assets against HTC's actual catalogue and usage rights.

## Mobile design
- Responsive layouts across desktop, tablet and phone.
- Two-column (col-6 style) category/product/room cards on mobile.
- Fixed bottom tab navigation on phone screens with safe-area padding.
- Large touch targets and stacked forms on small screens.


## HTC catalogue sync and image updates

The furniture page now reads `data/products.json` and `data/categories.json`, with responsive search, category filters, price-range filters and sorting. The initial JSON is a **partial verified snapshot**, not a claim that every HTC product has already been imported. Publicly indexed HTC products are included as examples; some have no local image until a sync succeeds.

Run this from the project root on a network that can reach [htcfurniture.in](https://htcfurniture.in):

```bash
npm run sync:catalog
```

The sync script reads HTC's public WordPress product API and shop HTML (for INR prices), writes `data/products.json` and `data/categories.json`, downloads product images to `public/images/products/`, category cover images to `public/images/categories/`, and records `data/sync-report.json`.

## Supabase admin panel

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in your project URL, anon key, and service role key.
3. In Supabase **Authentication → Users**, create an admin user (email + password).
4. After syncing the catalogue, seed Supabase:

```bash
npm run seed:supabase
```

5. Open `/admin` to sign in and manage products (name, SKU, price, local image path, publish/featured flags) and categories (name, description, cover image path).

The public `/furniture` page reads from Supabase when data is present; otherwise it falls back to the local JSON snapshot.

### Official contact details checked on HTC website

- Warehouse: 16/1, Gajapathy Chamber, Velapanchavady, Chennai – 600077
- Phone: +91 98400 48449
- Phone: +91 99401 27381
- No public email address was visible on the official Contact Us page when checked; the UI points customers to the contact form rather than inventing an email.

### Brand marks

The requested brands now use local, text-free symbolic SVG marks: Natuzzi, Calligaris, Stressless, Himolla, Koinor, Rolf Benz, BoConcept and Ligne Roset. These are illustrative icon marks, **not official partner logos**. Replace them with authorised vector assets if HTC has permission to display official marks.

### Image quality

The requested `showroom.webp`, `materials-swatches.webp` and `living-room-hero.webp` remain local WebP assets. Product images from the actual catalogue are downloaded at their source resolution when the catalogue sync is successful. Review all imagery and replace any moodboard-derived starter assets with separately approved full-resolution photography before launch.


## Latest UI update

- Removed the **Our Brands** item from the main header navigation. The brand section remains available on the collections/home content.
- Fixed the missing `next/image` import on the single product page that caused `ReferenceError: Image is not defined`.
- Added a first-visit dealer finder modal that requests browser geolocation on site load, supports city/PIN-code search when permission is unavailable, and opens a Google Maps dealer search when requested. Location permission is controlled by the visitor's browser.
- Updated product cards and product detail layout styling for a more premium, responsive presentation.
- Added category-to-image mapping for the home category cards and collection cards to avoid incorrect/missing category images.
- Upscaled and re-encoded smaller top-level static WebP images for more consistent responsive rendering.

### Image note
The catalogue currently includes four local image files per product. Where only one source product photo was available, those files are alternate crops/framing rather than independently generated camera angles. For true front/side/rear/detail views, replace the variants with approved multi-angle product photography or generate them per product.

### Validation note
`npm ci` could not complete in the current environment, so a full Next.js build/typecheck could not be run here. Run `npm ci` and `npm run build` locally before deploying.
