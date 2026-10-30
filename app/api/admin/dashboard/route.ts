import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/supabase/admin-guard";
export async function GET() {
 try { const {supabase}=await requireAdmin(); const [p,c,l]=await Promise.all([
  supabase.from("products").select("id,is_published,is_featured,price",{count:"exact"}),
  supabase.from("categories").select("slug",{count:"exact"}),
  supabase.from("admin_audit_log").select("id,action,entity_type,entity_id,created_at,actor_id").order("created_at",{ascending:false}).limit(10)
 ]);
 if(p.error||c.error||l.error) throw new Error("query failed");
 const rows=p.data||[]; return NextResponse.json({stats:{products:p.count||0,categories:c.count||0,published:rows.filter(x=>x.is_published).length,featured:rows.filter(x=>x.is_featured).length,priced:rows.filter(x=>x.price!==null).length},activity:l.data||[]});
 } catch { return NextResponse.json({error:"Unauthorised or unable to load dashboard."},{status:401}); }
}
