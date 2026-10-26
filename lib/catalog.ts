import productData from "@/data/products.json";
import categoryData from "@/data/categories.json";
import type { CatalogCategory, CatalogProduct } from "@/lib/types/catalog";
import { applyFeaturedFlags } from "@/lib/catalog-helpers";
import { getSiteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

function mapProduct(row: Record<string, unknown>): CatalogProduct {
  return {
    id: row.wp_id as number,
    name: row.name as string,
    slug: row.slug as string,
    sku: (row.sku as string) || undefined,
    price: row.price != null ? Number(row.price) : null,
    regularPrice: row.regular_price != null ? Number(row.regular_price) : null,
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    currency: (row.currency as string) || "INR",
    category: (row.primary_category as string) || undefined,
    categories: (row.categories as string[]) || [],
    categorySlugs: (row.category_slugs as string[]) || [],
    image: (row.image_path as string) || null,
    images: (row.images as CatalogProduct["images"]) || [],
    description: (row.description as string) || "",
    shortDescription: (row.short_description as string) || "",
    brand: (row.brand as string) || "HTC",
    stockStatus: (row.stock_status as string) || "in_stock",
    sourceUrl: (row.source_url as string) || null,
    isFeatured: Boolean(row.is_featured),
    isPublished: row.is_published !== false,
  };
}

function mapCategory(row: Record<string, unknown>): CatalogCategory {
  return {
    id: row.slug as string,
    name: row.name as string,
    slug: row.slug as string,
    parent: (row.parent_slug as string) || null,
    count: row.product_count != null ? Number(row.product_count) : undefined,
    description: (row.description as string) || "",
    image: (row.image_path as string) || null,
    sourceUrl: (row.source_url as string) || null,
  };
}

export async function getCatalog(): Promise<{ products: CatalogProduct[]; categories: CatalogCategory[]; source: "supabase" | "json" }> {
  const config = await getSiteConfig();
  const supabase = await createClient();

  if (supabase) {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("*").eq("is_published", true).order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (products?.length) {
      return {
        products: applyFeaturedFlags(products.map((p) => mapProduct(p as Record<string, unknown>)), config),
        categories: (categories || []).map((c) => mapCategory(c as Record<string, unknown>)),
        source: "supabase",
      };
    }
  }

  return {
    products: applyFeaturedFlags(productData as CatalogProduct[], config),
    categories: categoryData as CatalogCategory[],
    source: "json",
  };
}

export async function getAdminCatalog() {
  const config = await getSiteConfig();
  const supabase = await createClient();
  if (supabase) {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("*").order("updated_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (products?.length) {
      return {
        products: applyFeaturedFlags(products.map((p) => mapProduct(p as Record<string, unknown>)), config),
        categories: (categories || []).map((c) => mapCategory(c as Record<string, unknown>)),
        source: "supabase" as const,
      };
    }
  }
  return {
    products: applyFeaturedFlags(productData as CatalogProduct[], config),
    categories: categoryData as CatalogCategory[],
    source: "json" as const,
  };
}
