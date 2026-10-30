import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const products = JSON.parse(await fs.readFile(path.join(ROOT, "data/products.json"), "utf8"));
const categories = JSON.parse(await fs.readFile(path.join(ROOT, "data/categories.json"), "utf8"));

const rooms = [
  { slug: "living-room", name: "Living Room", description: "Sofas, lounge chairs, coffee tables and living storage.", image_path: "/images/living-room-hero.webp", sort_order: 1, match: /sofa|recliner|coffee.table|tv.unit|side.table|accent.chair|living/i },
  { slug: "bedroom", name: "Bedroom", description: "Beds, wardrobes, bedside tables and bedroom storage.", image_path: "/images/bedroom.webp", sort_order: 2, match: /bed|bedroom|mattress|wardrobe|dresser|night.stand/i },
  { slug: "dining-room", name: "Dining Room", description: "Dining tables, chairs, cabinets and bar furniture.", image_path: "/images/dining-room.webp", sort_order: 3, match: /dining|bar.chair|dining.chair|dining.table/i },
  { slug: "home-office", name: "Home Office", description: "Desks, task chairs and work storage.", image_path: "/images/home-office.webp", sort_order: 4, match: /office|computer.table|office.chair|visitor.chair|study/i },
  { slug: "outdoor-living", name: "Outdoor Living", description: "Outdoor seating and relaxed living pieces.", image_path: "/images/outdoor-living.webp", sort_order: 5, match: /outdoor|garden|patio/i },
  { slug: "reading-corner", name: "Reading Corner", description: "Accent chairs, side tables and occasional furniture.", image_path: "/images/accent-chair.webp", sort_order: 6, match: /accent.chair|lounge.chair|rocking.chair/i },
];
const brandNames = ["NATUZZI", "Calligaris", "Stressless", "Himolla", "KOINOR", "ROLF BENZ", "BoConcept", "Ligne Roset", "HTC"];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const brandRows = brandNames.map((name, i) => ({ slug: slugify(name), name, logo_path: "/brand/brands/" + ({ "NATUZZI":"natuzzi.svg", "Calligaris":"calligaris.svg", "Stressless":"stressless.svg", "Himolla":"himolla.svg", "KOINOR":"koinor.svg", "ROLF BENZ":"rolf-benz.svg", "BoConcept":"boconcept.svg", "Ligne Roset":"ligne-roset.svg", "HTC":"htc.svg" }[name]), is_featured: name !== "HTC", sort_order: i }));
const { error: bucketError } = await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: "15MB" });
if (bucketError && !/already exists|duplicate/i.test(bucketError.message)) throw bucketError;
const uploaded = new Map();
async function uploadLocalImage(localPath) {
  if (!localPath || !localPath.startsWith("/")) return localPath || null;
  if (uploaded.has(localPath)) return uploaded.get(localPath);
  const relative = localPath.replace(/^\/+/, "");
  const absolute = path.resolve(ROOT, "public", relative.replace(/^images\//, "images/").replace(/^brand\//, "brand/"));
  try {
    const bytes = await fs.readFile(absolute);
    const objectPath = relative.replace(/^images\//, "catalogue/").replace(/^brand\//, "brand/");
    const ext = path.extname(objectPath).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".svg" ? "image/svg+xml" : "image/webp";
    const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, { contentType, upsert: true, cacheControl: "31536000" });
    if (error) throw error;
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    uploaded.set(localPath, publicUrl);
    return publicUrl;
  } catch (error) {
    console.warn("Image not uploaded; retaining local path:", localPath, error instanceof Error ? error.message : error);
    uploaded.set(localPath, localPath);
    return localPath;
  }
}
const { error: brandError } = await supabase.from("brands").upsert(brandRows, { onConflict: "slug" });
if (brandError) throw brandError;
const roomRows = rooms.map(({ match, ...r }) => r);
const { error: roomError } = await supabase.from("rooms").upsert(roomRows, { onConflict: "slug" });
if (roomError) throw roomError;

console.log("Uploading category and product images to Supabase Storage…");
const categoryRows = await Promise.all(categories.map(async (c, index) => ({
  slug: c.slug, name: c.name, parent_slug: c.parent || null, description: c.description || "",
  image_path: await uploadLocalImage(c.image), product_count: c.count || 0, source_url: c.sourceUrl || null,
  sort_order: index, updated_at: new Date().toISOString(),
})));
const { error: catError } = await supabase.from("categories").upsert(categoryRows, { onConflict: "slug" });
if (catError) throw catError;

const productRows = [];
for (let start = 0; start < products.length; start += 25) {
  const sourceBatch = products.slice(start, start + 25);
  const rows = await Promise.all(sourceBatch.map(async (p) => {
    const imageList = await Promise.all((p.images || []).map(async (image) => ({ ...image, src: await uploadLocalImage(image.src) })));
    const imagePath = await uploadLocalImage(p.image || imageList[0]?.src);
    return {
      wp_id: p.id, name: p.name, display_name: p.displayName || p.name, slug: p.slug || null, sku: p.sku || p.name,
      price: p.price ?? null, regular_price: p.regularPrice ?? p.price ?? null, sale_price: p.salePrice ?? null,
      currency: p.currency || "INR", primary_category: p.category || p.categories?.[0] || null,
      categories: p.categories || [], category_slugs: p.categorySlugs || [], description: p.description || "",
      short_description: p.shortDescription || "", brand: p.brand || "HTC", image_path: imagePath, images: imageList,
      stock_status: p.stockStatus || "in_stock", source_url: p.sourceUrl || p.permalink || null,
      is_featured: false, is_published: true, updated_at: new Date().toISOString(),
    };
  }));
  productRows.push(...rows);
  console.log(`Prepared products with images ${Math.min(start + rows.length, products.length)}/${products.length}`);
}
for (let i = 0; i < productRows.length; i += 75) {
  const batch = productRows.slice(i, i + 75);
  const { error } = await supabase.from("products").upsert(batch, { onConflict: "wp_id" });
  if (error) throw error;
  console.log(`Seeded products ${Math.min(i + batch.length, productRows.length)}/${productRows.length}`);
}

const productRoomRows = [];
const productBrandRows = [];
for (const p of products) {
  const terms = [p.category, ...(p.categories || []), ...(p.categorySlugs || [])].filter(Boolean).join(" ").toLowerCase();
  for (const room of rooms) if (room.match.test(terms)) productRoomRows.push({ product_wp_id: p.id, room_slug: room.slug });
  const brand = brandNames.find((name) => name.toLowerCase() === String(p.brand || "HTC").toLowerCase()) || "HTC";
  productBrandRows.push({ product_wp_id: p.id, brand_slug: slugify(brand) });
}
for (let i = 0; i < productRoomRows.length; i += 500) {
  const { error } = await supabase.from("product_rooms").upsert(productRoomRows.slice(i, i + 500), { onConflict: "product_wp_id,room_slug" });
  if (error) throw error;
}
for (let i = 0; i < productBrandRows.length; i += 500) {
  const { error } = await supabase.from("product_brands").upsert(productBrandRows.slice(i, i + 500), { onConflict: "product_wp_id,brand_slug" });
  if (error) throw error;
}
console.log(`Done: ${categoryRows.length} categories, ${productRows.length} products, ${uploaded.size} local images, ${rooms.length} rooms, ${brandRows.length} brands, ${productRoomRows.length} room links, ${productBrandRows.length} brand links.`);
