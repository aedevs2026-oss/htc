import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/supabase/admin-guard";
export async function GET() {
 try { const {supabase}=await requireAdmin(); const {data,error}=await supabase.from("site_settings").select("key,value"); if(error) throw error; return NextResponse.json({data}); }
 catch { return NextResponse.json({error:"Unauthorised."},{status:401}); }
}
export async function PUT(request:Request) {
 try { const {supabase,user}=await requireAdmin(); const body=await request.json(); const entries=Object.entries(body||{}).slice(0,80);
 const rows=entries.map(([key,value])=>({key:key.slice(0,100),value,updated_at:new Date().toISOString()}));
 const {error}=await supabase.from("site_settings").upsert(rows,{onConflict:"key"}); if(error) throw error;
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"settings.update",entity_type:"site_settings",details:{keys:rows.map(r=>r.key)}});
 return NextResponse.json({success:true});
 } catch { return NextResponse.json({error:"Unauthorised or unable to save settings."},{status:401}); }
}
