"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { getSiteConfig, saveSiteConfig, type SiteConfig } from "@/lib/site-config";

export async function updateProductAction(input: {wpId:number;name:string;sku:string;price:string;imagePath:string;stockStatus:string;isPublished:boolean;isFeatured:boolean;description:string}) {
 const {supabase,user}=await requireAdmin();
 const price=input.price?Number(input.price):null;
 if(price!==null&&(!Number.isFinite(price)||price<0)) throw new Error("Invalid price");
 const {error}=await supabase.from("products").update({name:input.name.slice(0,240),sku:input.sku.slice(0,120),price,regular_price:price,image_path:input.imagePath.slice(0,1000)||null,stock_status:input.stockStatus,is_published:input.isPublished,is_featured:input.isFeatured,description:input.description.slice(0,12000),updated_at:new Date().toISOString()}).eq("wp_id",input.wpId);
 if(error) throw new Error(error.message);
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"product.update",entity_type:"product",entity_id:String(input.wpId)});
 [" /admin/products","/furniture","/","/collections"].forEach(p=>revalidatePath(p.trim()));
}
export async function saveSiteConfigAction(input:SiteConfig) {
 const {supabase,user}=await requireAdmin();
 const values={heroStats:input.heroStats,featuredProductIds:input.featuredProductIds.slice(0,100),spotlightCategorySlugs:input.spotlightCategorySlugs.slice(0,30),collectionSlugs:input.collectionSlugs.slice(0,30)};
 const rows=Object.entries(values).map(([key,value])=>({key,value,updated_at:new Date().toISOString()}));
 const {error}=await supabase.from("site_settings").upsert(rows,{onConflict:"key"}); if(error) throw new Error(error.message);
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"homepage.settings.update",entity_type:"site_settings"});
 ["/admin/homepage","/","/collections","/furniture"].forEach(revalidatePath);
}
export async function setFeaturedProductAction(wpId:number,featured:boolean) {
 const {supabase,user}=await requireAdmin();
 const {error}=await supabase.from("products").update({is_featured:featured,updated_at:new Date().toISOString()}).eq("wp_id",wpId); if(error) throw new Error(error.message);
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"product.featured",entity_type:"product",entity_id:String(wpId),details:{featured}});
 ["/admin/homepage","/","/collections"].forEach(revalidatePath);
}
export async function updateCategoryAction(input:{slug:string;name:string;description:string;imagePath:string;sortOrder:string}) {
 const {supabase,user}=await requireAdmin();
 const {error}=await supabase.from("categories").update({name:input.name.slice(0,160),description:input.description.slice(0,4000),image_path:input.imagePath.slice(0,1000)||null,sort_order:Number(input.sortOrder)||0,updated_at:new Date().toISOString()}).eq("slug",input.slug);
 if(error) throw new Error(error.message);
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"category.update",entity_type:"category",entity_id:input.slug});
 ["/admin/categories","/furniture","/","/collections"].forEach(revalidatePath);
}
