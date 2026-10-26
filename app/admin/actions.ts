"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteConfig, saveSiteConfig, type SiteConfig } from "@/lib/site-config";

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return supabase;
}

export async function updateProductAction(input: {
  wpId: number;
  name: string;
  sku: string;
  price: string;
  imagePath: string;
  stockStatus: string;
  isPublished: boolean;
  isFeatured: boolean;
  description: string;
}) {
  const supabase = await requireUser();
  const price = input.price ? Number(input.price) : null;
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      sku: input.sku,
      price,
      regular_price: price,
      image_path: input.imagePath || null,
      stock_status: input.stockStatus,
      is_published: input.isPublished,
      is_featured: input.isFeatured,
      description: input.description,
      updated_at: new Date().toISOString(),
    })
    .eq("wp_id", input.wpId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/furniture");
  revalidatePath("/");
  revalidatePath("/collections");
}

export async function saveSiteConfigAction(input: SiteConfig) {
  await requireUser();
  await saveSiteConfig(input);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/furniture");
}

export async function setFeaturedProductAction(wpId: number, featured: boolean) {
  await requireUser();
  const config = await getSiteConfig();
  const ids = new Set(config.featuredProductIds.map(Number));
  if (featured) ids.add(wpId);
  else ids.delete(wpId);
  config.featuredProductIds = [...ids];
  await saveSiteConfig(config);

  const supabase = await createClient();
  if (supabase) {
    await supabase.from("products").update({ is_featured: featured, updated_at: new Date().toISOString() }).eq("wp_id", wpId);
  }

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  revalidatePath("/collections");
}

export async function updateCategoryAction(input: {
  slug: string;
  name: string;
  description: string;
  imagePath: string;
  sortOrder: string;
}) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      description: input.description,
      image_path: input.imagePath || null,
      sort_order: Number(input.sortOrder || 0),
      updated_at: new Date().toISOString(),
    })
    .eq("slug", input.slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/furniture");
  revalidatePath("/");
  revalidatePath("/collections");
}
