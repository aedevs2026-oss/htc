import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
export const runtime = "nodejs";
export async function GET() {
  try { const {supabase}=await requireAdmin(); const {data,error}=await supabase.from("categories").select("*").order("sort_order").order("name"); if(error) throw error; return NextResponse.json({data}); }
  catch { return NextResponse.json({error:"Unauthorised."},{status:401}); }
}
export async function POST(request:Request) {
  try {
    const {supabase,user}=await requireAdmin(); const b=await request.json();
    const name=String(b.name||"").trim().slice(0,160);
    const slug=String(b.slug||name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")).slice(0,180);
    if(!name||!slug) return NextResponse.json({error:"Name and slug required."},{status:400});
    const {data,error}=await supabase.from("categories").insert({name,slug,description:String(b.description||"").slice(0,4000),image_path:String(b.image_path||"").slice(0,1000)||null,sort_order:Number(b.sort_order)||0}).select().single();
    if(error) throw error;
    await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"category.create",entity_type:"category",entity_id:slug});
    return NextResponse.json({data},{status:201});
  } catch { return NextResponse.json({error:"Unauthorised or unable to create category."},{status:401}); }
}
