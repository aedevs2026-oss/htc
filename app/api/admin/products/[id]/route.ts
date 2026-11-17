import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const allowed: Record<string, string> = {
      name:"name", displayName:"display_name", slug:"slug", sku:"sku", price:"price",
      regularPrice:"regular_price", salePrice:"sale_price", description:"description",
      shortDescription:"short_description", image:"image_path", images:"images",
      stockStatus:"stock_status", isPublished:"is_published", isFeatured:"is_featured",
      category:"primary_category", categories:"categories", categorySlugs:"category_slugs"
    };
    const patch: Record<string, unknown> = {};
    for (const [key, column] of Object.entries(allowed)) if (key in body) patch[column] = body[key];
    if (!Object.keys(patch).length) return NextResponse.json({ error:"No editable fields supplied." },{status:400});
    if ("price" in patch && patch.price !== null && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) return NextResponse.json({error:"Invalid price."},{status:400});
    if ("images" in patch && (!Array.isArray(patch.images) || patch.images.length > 12)) return NextResponse.json({error:"Invalid images."},{status:400});
    patch.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();
    if (error) throw error;
    await supabase.from("admin_audit_log").insert({ actor_id:user.id, action:"product.update", entity_type:"product", entity_id:id, details:{ fields:Object.keys(patch) } });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({error:"Unauthorised or unable to update product."},{status:401});
  }
}
export async function DELETE(_request: Request, context: Context) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await context.params;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    await supabase.from("admin_audit_log").insert({ actor_id:user.id, action:"product.delete", entity_type:"product", entity_id:id });
    return NextResponse.json({ success:true });
  } catch {
    return NextResponse.json({error:"Unauthorised or unable to delete product."},{status:401});
  }
}
