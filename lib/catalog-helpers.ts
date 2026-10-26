import type { CatalogCategory, CatalogProduct } from "@/lib/types/catalog";
import type { SiteConfig } from "@/lib/site-config";

const FALLBACK_PRODUCT_IMAGE = "/images/sofa-product.webp";

export function categoryImageSrc(category: Pick<CatalogCategory, "slug" | "name" | "image">) {
  const explicit: Record<string, string> = {
    sofa: "/images/category-living.webp", sofas: "/images/category-living.webp",
    bedroom: "/images/bedroom.webp", "bed-1-5": "/images/bed-product.webp", "bed-1-8": "/images/bed-product.webp",
    "bedroom-set": "/images/bedroom.webp", dining: "/images/category-dining.webp",
    "dining-set-4ch": "/images/dining-collection.webp", "dining-set-6ch": "/images/dining-collection.webp",
    "office-furniture": "/images/home-office.webp", "boss10-office-chair": "/images/chair-product.webp",
    "coffee-table": "/images/category-premium.webp", wardrobe: "/images/walnut-storage.webp",
    "book-shelf": "/images/walnut-storage.webp", recliner: "/images/recliner-editorial.webp",
    "bar-chair": "/images/accent-chair.webp", "outdoor-furniture": "/images/outdoor-living.webp",
  };
  if (explicit[category.slug]) return explicit[category.slug];
  const value = `${category.name} ${category.slug}`.toLowerCase();
  if (/reclin/.test(value)) return "/images/recliner-editorial.webp";
  if (/sofa|couch|sectional|living/.test(value)) return "/images/category-living.webp";
  if (/bed|bedroom|mattress/.test(value)) return "/images/bedroom.webp";
  if (/dining|table/.test(value)) return "/images/category-dining.webp";
  if (/office|boss10|workstation/.test(value)) return "/images/home-office.webp";
  if (/wardrobe|storage|shelf|cabinet/.test(value)) return "/images/walnut-storage.webp";
  if (/chair|stool/.test(value)) return "/images/accent-chair.webp";
  if (/outdoor|garden/.test(value)) return "/images/outdoor-living.webp";
  return "/images/category-premium.webp";
}

export function productImageSrc(product: Pick<CatalogProduct, "image" | "images">) {
  const candidate = product.image || product.images?.[0]?.src;
  if (candidate?.startsWith("/") && !candidate.startsWith("//")) return candidate;
  return FALLBACK_PRODUCT_IMAGE;
}

export function formatInr(price: number | null | undefined) {
  if (price == null) return null;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export function applyFeaturedFlags(products: CatalogProduct[], config: SiteConfig) {
  const ids = new Set(config.featuredProductIds.map(Number));
  return products.map((p) => ({
    ...p,
    isFeatured: Boolean(p.isFeatured) || ids.has(Number(p.id)),
  }));
}

export function getFeaturedProducts(products: CatalogProduct[], limit = 8) {
  const withImage = products.filter((p) => productImageSrc(p) !== FALLBACK_PRODUCT_IMAGE);
  const pool = [
    ...products.filter((p) => p.isFeatured),
    ...withImage.filter((p) => p.categories?.some((c) => /new arrival/i.test(c))),
    ...withImage.filter((p) => p.price != null),
    ...products,
  ];
  const seen = new Set<string | number>();
  const out: CatalogProduct[] = [];
  for (const product of pool) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    out.push(product);
    if (out.length >= limit) break;
  }
  return out;
}

const CATEGORY_ALIASES: Record<string, string> = {
  sofas: "Sofa",
  sofa: "Sofa",
  beds: "Bedroom",
  bedroom: "Bedroom",
  dining: "Dining",
  recliners: "Sofa",
  chairs: "Office Furniture",
  storage: "Wardrobe",
  office: "Office Furniture",
  coffee: "Coffee Table",
};

export function resolveCategoryFilter(query: string | undefined, categories: CatalogCategory[]) {
  if (!query) return "All furniture";
  const decoded = decodeURIComponent(query).trim();
  const alias = CATEGORY_ALIASES[decoded.toLowerCase()];
  if (alias) return alias;
  const exact = categories.find((c) => c.slug === decoded || c.name.toLowerCase() === decoded.toLowerCase());
  if (exact) return exact.name;
  const partial = categories.find((c) => c.name.toLowerCase().includes(decoded.toLowerCase()));
  return partial?.name || "All furniture";
}

const HOME_CATEGORY_SLUGS = ["sofa", "bedroom", "dining", "office-furniture", "coffee-table", "wardrobe"];

export function getHomeCategories(categories: CatalogCategory[], config: SiteConfig, limit = 6) {
  const slugs = config.spotlightCategorySlugs.length ? config.spotlightCategorySlugs : HOME_CATEGORY_SLUGS;
  const picked = slugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as CatalogCategory[];
  if (picked.length >= limit) return picked.slice(0, limit);
  const rest = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0));
  const seen = new Set(picked.map((c) => c.slug));
  for (const cat of rest) {
    if (seen.has(cat.slug)) continue;
    picked.push(cat);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function getCollectionGroups(categories: CatalogCategory[], config: SiteConfig, limit = 4) {
  return getHomeCategories(categories, { ...config, spotlightCategorySlugs: config.collectionSlugs.length ? config.collectionSlugs : config.spotlightCategorySlugs }, limit);
}

export function productsForCategory(products: CatalogProduct[], category: CatalogCategory, limit = 4) {
  return products
    .filter((p) => (p.categorySlugs || []).includes(category.slug) || p.category === category.name || p.categories?.includes(category.name))
    .slice(0, limit);
}
