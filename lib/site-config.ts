import "server-only";
import { createClient } from "@/lib/supabase/server";
export type SiteConfig={heroStats:{brands:string;designs:string;dealers:string};featuredProductIds:number[];spotlightCategorySlugs:string[];collectionSlugs:string[]};
export const defaultSiteConfig:SiteConfig={heroStats:{brands:"10+",designs:"510+",dealers:"25+"},featuredProductIds:[],spotlightCategorySlugs:["sofa","bedroom","dining","office-furniture","coffee-table","wardrobe"],collectionSlugs:["sofa","bedroom","dining","new"]};
export async function getSiteConfig():Promise<SiteConfig>{
 const supabase=await createClient();
 if(supabase){const {data}=await supabase.from("site_settings").select("key,value");if(data?.length){const v=Object.fromEntries(data.map(x=>[x.key,x.value]));return {...defaultSiteConfig,heroStats:{...defaultSiteConfig.heroStats,...(v.heroStats||{})},featuredProductIds:v.featuredProductIds||[],spotlightCategorySlugs:v.spotlightCategorySlugs||defaultSiteConfig.spotlightCategorySlugs,collectionSlugs:v.collectionSlugs||defaultSiteConfig.collectionSlugs};}}
 return defaultSiteConfig;
}
export async function saveSiteConfig(config:SiteConfig){const supabase=await createClient();if(!supabase)throw new Error("Supabase is not configured");const rows=Object.entries(config).map(([key,value])=>({key,value,updated_at:new Date().toISOString()}));const {error}=await supabase.from("site_settings").upsert(rows,{onConflict:"key"});if(error)throw new Error(error.message);}
