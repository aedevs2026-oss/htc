import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const page = Math.max(0, Math.min(10000, Number(url.searchParams.get("page") || 0)));
    const from = page * 50;
    let query = supabase.from("products").select("*", { count: "exact" }).order("name").range(from, from + 49);
    if (q) query = query.or("name.ilike.%"+q.replace(/[%_]/g, "")+"%,sku.ilike.%"+q.replace(/[%_]/g, "")+"%");
    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ data, count, page });
  } catch {
    return NextResponse.json({ error: "Unauthorised or unable to load products." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin();
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 240);
    const slug = String(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 250);
    if (!name || !slug) return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    const payload = {
      name, slug, sku: String(body.sku || "").slice(0, 120) || null,
      price: body.price === "" || body.price == null ? null : Number(body.price),
      currency: "INR", primary_category: String(body.primary_category || "") || null,
      categories: Array.isArray(body.categories) ? body.categories.map(String).slice(0, 30) : [],
      category_slugs: Array.isArray(body.category_slugs) ? body.category_slugs.map(String).slice(0, 30) : [],
      description: String(body.description || "").slice(0, 12000),
      short_description: String(body.short_description || "").slice(0, 600),
      image_path: String(body.image_path || "").slice(0, 1000) || null,
      images: Array.isArray(body.images) ? body.images.slice(0, 12) : [],
      stock_status: ["in_stock","out_of_stock","on_backorder"].includes(body.stock_status) ? body.stock_status : "in_stock",
      is_published: Boolean(body.is_published), is_featured: Boolean(body.is_featured), updated_at: new Date().toISOString()
    };
    if (payload.price !== null && (!Number.isFinite(payload.price) || payload.price < 0)) return NextResponse.json({error:"Invalid price."},{status:400});
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) throw error;
    await supabase.from("admin_audit_log").insert({ actor_id: user.id, action: "product.create", entity_type: "product", entity_id: data.id, details: { name } });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorised or unable to create product." }, { status: 401 });
  }
}
