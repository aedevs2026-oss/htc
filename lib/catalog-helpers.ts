import type { CatalogProduct } from "@/lib/types/catalog";
import type { SiteConfig } from "@/lib/site-config";

const FALLBACK_PRODUCT_IMAGE = "/images/sofa-product.webp";

export function categoryImageSrc(category: { slug: string; name: string; image?: string | null }) {
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

/** Return a safe local image path, preferring the primary image then gallery image. */
export function productImageSrc(product: Pick<CatalogProduct, "image" | "images">) {
  const candidates = [product.image, ...(product.images || []).map((image) => image?.src)];
  const candidate = candidates.find((src): src is string => typeof src === "string" && src.startsWith("/") && !src.startsWith("//"));
  return candidate || FALLBACK_PRODUCT_IMAGE;
}

export function formatInr(price: number | null | undefined) {
  if (price == null) return null;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export function applyFeaturedFlags(products: CatalogProduct[], config: SiteConfig) {
  const ids = new Set(config.featuredProductIds.map(Number));
  return products.map((p) => ({ ...p, isFeatured: Boolean(p.isFeatured) || ids.has(Number(p.id)) }));
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
