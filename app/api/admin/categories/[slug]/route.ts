import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
export const runtime="nodejs";
type Context={params:Promise<{slug:string}>};
export async function PATCH(request:Request,context:Context) {
  try { const {supabase,user}=await requireAdmin(); const {slug}=await context.params; const b=await request.json(); const patch:Record<string,unknown>={};
    for(const [k,c] of Object.entries({name:"name",description:"description",image_path:"image_path",sort_order:"sort_order",parent_slug:"parent_slug"})) if(k in b) patch[c]=b[k];
    patch.updated_at=new Date().toISOString(); const {data,error}=await supabase.from("categories").update(patch).eq("slug",slug).select().single(); if(error) throw error;
    await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"category.update",entity_type:"category",entity_id:slug,details:{fields:Object.keys(patch)}});
    return NextResponse.json({data});
  } catch { return NextResponse.json({error:"Unauthorised or unable to update category."},{status:401}); }
}
export async function DELETE(_request:Request,context:Context) {
  try { const {supabase,user}=await requireAdmin(); const {slug}=await context.params; const {error}=await supabase.from("categories").delete().eq("slug",slug); if(error) throw error;
    await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"category.delete",entity_type:"category",entity_id:slug}); return NextResponse.json({success:true});
  } catch { return NextResponse.json({error:"Unauthorised or unable to delete category."},{status:401}); }
}
