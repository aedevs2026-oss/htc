import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const products = JSON.parse(await fs.readFile(path.join(ROOT, 'data/products.json'), 'utf8'));
const categories = JSON.parse(await fs.readFile(path.join(ROOT, 'data/categories.json'), 'utf8'));

const categoryRows = categories.map((c, index) => ({
  slug: c.slug,
  name: c.name,
  parent_slug: c.parent || null,
  description: c.description || '',
  image_path: c.image || null,
  product_count: c.count || 0,
  source_url: c.sourceUrl || null,
  sort_order: index,
  updated_at: new Date().toISOString(),
}));

const { error: catError } = await supabase.from('categories').upsert(categoryRows, { onConflict: 'slug' });
if (catError) throw catError;

const productRows = products.map((p) => ({
  wp_id: p.id,
  name: p.name,
  slug: p.slug || null,
  sku: p.sku || p.name,
  price: p.price ?? null,
  regular_price: p.regularPrice ?? p.price ?? null,
  sale_price: p.salePrice ?? null,
  currency: p.currency || 'INR',
  primary_category: p.category || p.categories?.[0] || null,
  categories: p.categories || [],
  category_slugs: p.categorySlugs || [],
  description: p.description || '',
  short_description: p.shortDescription || '',
  brand: p.brand || 'HTC',
  image_path: p.image || null,
  images: p.images || [],
  stock_status: p.stockStatus || 'in_stock',
  source_url: p.sourceUrl || p.permalink || null,
  is_featured: false,
  is_published: true,
  updated_at: new Date().toISOString(),
}));

for (let i = 0; i < productRows.length; i += 100) {
  const batch = productRows.slice(i, i + 100);
  const { error } = await supabase.from('products').upsert(batch, { onConflict: 'wp_id' });
  if (error) throw error;
  console.log(`Seeded products ${Math.min(i + 100, productRows.length)}/${productRows.length}`);
}

console.log(`Done: ${categoryRows.length} categories, ${productRows.length} products.`);
