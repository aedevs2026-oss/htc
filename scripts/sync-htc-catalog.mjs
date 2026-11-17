import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = (process.env.HTC_SITE_URL || 'https://htcfurniture.in').replace(/\/$/, '');
const WP_API = `${SITE}/wp-json/wp/v2`;
const OUT = path.join(ROOT, 'data');
const PRODUCT_IMAGE_DIR = path.join(ROOT, 'public/images/products');
const CATEGORY_IMAGE_DIR = path.join(ROOT, 'public/images/categories');
const FALLBACK_IMAGE = '/images/sofa-product.webp';
const SHOP_PAGE_SIZE = 12;

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 110) || 'product';

const titleFromSlug = (slug) =>
  slug
    .split('-')
    .map((w) => (/^\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

const parseInr = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function getText(url, { allowNotFound = false } = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HTC-Furniture-Catalog-Sync/1.0', Accept: 'text/html,application/json' },
  });
  if (!response.ok) {
    if (allowNotFound && response.status === 404) return null;
    throw new Error(`Request failed ${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HTC-Furniture-Catalog-Sync/1.0', Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Request failed ${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function parseShopProducts(html) {
  const chunks = html.split('product-in-grid type-product');
  const rows = [];
  for (const chunk of chunks.slice(1)) {
    const idMatch = chunk.match(/data-id="(\d+)"/);
    const titleMatch = chunk.match(/<h3 class="product-title"><a[^>]*>([^<]+)<\/a><\/h3>/);
    const linkMatch = chunk.match(/<a href="(https:\/\/[^"]+\/product\/[^"]+)" class="product-image-link">/);
    const imgMatch = chunk.match(/<img[^>]+src="([^"]+)"/);
    const priceMatch = chunk.match(/<span class="price">([\s\S]*?)<\/span>/);
    const cats = [...chunk.matchAll(/product_cat-([a-z0-9-]+)/g)].map((m) => m[1]);
    const uniqueCats = [...new Set(cats)];
    if (!idMatch || !titleMatch) continue;
    const priceText = priceMatch ? priceMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    rows.push({
      id: Number(idMatch[1]),
      name: titleMatch[1].trim(),
      link: linkMatch?.[1] || null,
      imageUrl: imgMatch?.[1] || null,
      price: parseInr(priceText),
      categorySlugs: uniqueCats,
    });
  }
  return rows;
}

async function scrapeShopCatalog() {
  const byId = new Map();
  let page = 1;
  let maxPages = 60;
  while (page <= maxPages) {
    const url = page === 1 ? `${SITE}/shop/` : `${SITE}/shop/page/${page}/`;
    const html = await getText(url, { allowNotFound: page > 1 });
    if (!html) break;
    const totalResults = html.match(/of\s+([\d,]+)\s+results/i);
    if (totalResults) maxPages = Math.max(1, Math.ceil(Number(totalResults[1].replace(/,/g, '')) / SHOP_PAGE_SIZE));
    const totalPagesMatch = html.match(/class="page-numbers">\s*(\d+)\s*<\/span>\s*<\/nav>/);
    if (totalPagesMatch) maxPages = Math.min(maxPages, Number(totalPagesMatch[1]));
    const batch = parseShopProducts(html);
    if (!batch.length) {
      if (page > 1) break;
      throw new Error(`No products parsed from shop page: ${url}`);
    }
    for (const row of batch) byId.set(row.id, row);
    console.log(`shop: page ${page}/${maxPages}, ${byId.size} products`);
    page += 1;
    if (page > maxPages) break;
  }
  return byId;
}

async function fetchWpProducts() {
  const rows = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${WP_API}/product?per_page=100&page=${page}&_embed=wp:featuredmedia`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HTC-Furniture-Catalog-Sync/1.0', Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`WP product page ${page} failed: ${response.status}`);
    totalPages = Number(response.headers.get('x-wp-totalpages') || 1);
    const batch = await response.json();
    if (!Array.isArray(batch) || !batch.length) break;
    rows.push(...batch);
    console.log(`wp: page ${page}/${totalPages}, ${rows.length} products`);
    page += 1;
  }
  return rows;
}

function categorySlugsFromWp(item) {
  const list = item.class_list || [];
  return [...new Set(list.filter((c) => c.startsWith('product_cat-')).map((c) => c.replace('product_cat-', '')))];
}

function pickImageUrl(item) {
  const media = item._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const sizes = media.media_details?.sizes;
  return (
    sizes?.woocommerce_single?.source_url ||
    sizes?.large?.source_url ||
    sizes?.full?.source_url ||
    media.source_url ||
    null
  );
}

async function saveRemoteImage(url, filename) {
  if (!url) return null;
  const ext = new URL(url).pathname.match(/\.(webp|png|jpe?g|avif)$/i)?.[1]?.toLowerCase() || 'jpg';
  const safe = `${filename}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const dest = path.join(PRODUCT_IMAGE_DIR, safe);
  const publicPath = `/images/products/${safe}`;
  try {
    await fs.access(dest);
    return publicPath;
  } catch {}
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'HTC-Furniture-Catalog-Sync/1.0' } });
    if (!response.ok) throw new Error(`image HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 800) throw new Error('image too small');
    await fs.writeFile(dest, buffer);
    return publicPath;
  } catch (error) {
    console.warn(`Could not download ${url}: ${error.message}`);
    return null;
  }
}

async function saveCategoryImage(slug, url) {
  if (!url) return null;
  const ext = new URL(url).pathname.match(/\.(webp|png|jpe?g|avif)$/i)?.[1]?.toLowerCase() || 'jpg';
  const safe = `${slug}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const dest = path.join(CATEGORY_IMAGE_DIR, safe);
  const publicPath = `/images/categories/${safe}`;
  try {
    await fs.access(dest);
    return publicPath;
  } catch {}
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'HTC-Furniture-Catalog-Sync/1.0' } });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 800) return null;
    await fs.writeFile(dest, buffer);
    return publicPath;
  } catch {
    return null;
  }
}

async function categoryCoverFromSite(slug) {
  try {
    const html = await getText(`${SITE}/product-category/${slug}/`);
    const img = html.match(/class="product-image-link"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/);
    return img?.[1] || null;
  } catch {
    return null;
  }
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(PRODUCT_IMAGE_DIR, { recursive: true });
await fs.mkdir(CATEGORY_IMAGE_DIR, { recursive: true });

const [shopById, wpProducts] = await Promise.all([scrapeShopCatalog(), fetchWpProducts()]);

const categoryCounts = new Map();
const products = [];

for (const wp of wpProducts) {
  const shop = shopById.get(wp.id);
  const slugs = [...new Set([...(shop?.categorySlugs || []), ...categorySlugsFromWp(wp)])];
  for (const slug of slugs) categoryCounts.set(slug, (categoryCounts.get(slug) || 0) + 1);

  const name = shop?.name || wp.title?.rendered || 'Untitled';
  const slug = wp.slug || slugify(name);
  const imageUrl = pickImageUrl(wp) || shop?.imageUrl;
  const localImage = await saveRemoteImage(imageUrl, `${wp.id}-${slugify(slug)}`);
  const catNames = slugs.map(titleFromSlug);
  const price = shop?.price ?? null;

  products.push({
    id: wp.id,
    name,
    slug,
    sku: name,
    price,
    regularPrice: price,
    salePrice: null,
    currency: 'INR',
    category: catNames[0] || 'Uncategorised',
    categories: catNames,
    categorySlugs: slugs,
    image: localImage || FALLBACK_IMAGE,
    images: localImage ? [{ src: localImage, alt: name, source: imageUrl }] : [],
    description: wp.content?.rendered?.replace(/<[^>]+>/g, ' ').trim() || '',
    shortDescription: wp.excerpt?.rendered?.replace(/<[^>]+>/g, ' ').trim() || '',
    brand: 'HTC',
    stockStatus: wp.class_list?.includes('outofstock') ? 'out_of_stock' : 'in_stock',
    permalink: shop?.link || wp.link || null,
    sourceUrl: shop?.link || wp.link || null,
    source: 'HTC public WordPress + shop HTML',
  });
}

for (const [id, shop] of shopById) {
  if (products.some((p) => p.id === id)) continue;
  const slugs = shop.categorySlugs || [];
  for (const slug of slugs) categoryCounts.set(slug, (categoryCounts.get(slug) || 0) + 1);
  const catNames = slugs.map(titleFromSlug);
  const localImage = await saveRemoteImage(shop.imageUrl, `${id}-${slugify(shop.name)}`);
  products.push({
    id,
    name: shop.name,
    slug: slugify(shop.name),
    sku: shop.name,
    price: shop.price,
    regularPrice: shop.price,
    salePrice: null,
    currency: 'INR',
    category: catNames[0] || 'Uncategorised',
    categories: catNames,
    categorySlugs: slugs,
    image: localImage || FALLBACK_IMAGE,
    images: localImage ? [{ src: localImage, alt: shop.name, source: shop.imageUrl }] : [],
    description: '',
    shortDescription: '',
    brand: 'HTC',
    stockStatus: 'in_stock',
    permalink: shop.link,
    sourceUrl: shop.link,
    source: 'HTC shop HTML only',
  });
}

products.sort((a, b) => a.name.localeCompare(b.name));

const categories = [];
for (const [slug, count] of [...categoryCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const sampleProduct = products.find((p) => (p.categorySlugs || []).includes(slug) && p.image && !p.image.includes('sofa-product'));
  const remote = (await categoryCoverFromSite(slug)) || sampleProduct?.images?.[0]?.source || null;
  let image = (await saveCategoryImage(slug, remote)) || null;
  if (!image && sampleProduct?.image?.startsWith('/images/products/')) {
    image = sampleProduct.image;
  }
  categories.push({
    id: slug,
    name: titleFromSlug(slug),
    slug,
    parent: null,
    count,
    description: `${titleFromSlug(slug)} — ${count} products in HTC catalogue.`,
    image,
    sourceUrl: `${SITE}/product-category/${slug}/`,
  });
}

const report = {
  source: SITE,
  syncedAt: new Date().toISOString(),
  products: products.length,
  categories: categories.length,
  withPrice: products.filter((p) => p.price != null).length,
  downloadedProductImages: products.filter((p) => p.image && !p.image.includes('sofa-product')).length,
  downloadedCategoryImages: categories.filter((c) => c.image).length,
  note: 'Uses wp-json/wp/v2/product for metadata and /shop/ HTML for INR prices. Images saved under public/images/products and public/images/categories.',
};

await fs.writeFile(path.join(OUT, 'products.json'), JSON.stringify(products, null, 2));
await fs.writeFile(path.join(OUT, 'categories.json'), JSON.stringify(categories, null, 2));
await fs.writeFile(path.join(OUT, 'sync-report.json'), JSON.stringify(report, null, 2));

console.log(`Done: ${report.products} products, ${report.categories} categories (${report.withPrice} priced).`);
