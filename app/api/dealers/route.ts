import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: [] });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  let query = supabase.from("dealers").select("id,name,slug,city,state,pincode,address,phone,email,website,latitude,longitude,description,is_authorised").eq("is_active", true).order("city").limit(100);
  if (q) query = query.or(`city.ilike.%${q.replace(/[%_,]/g, "")}%,pincode.ilike.%${q.replace(/[%_,]/g, "")}%,name.ilike.%${q.replace(/[%_,]/g, "")}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Unable to load dealer locations." }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}
