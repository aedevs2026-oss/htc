import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/supabase/admin-guard";
export async function GET() {
 try {const {supabase}=await requireAdmin();const {data,error}=await supabase.from("admin_audit_log").select("*").order("created_at",{ascending:false}).limit(100);if(error)throw error;return NextResponse.json({data});}
 catch{return NextResponse.json({error:"Unauthorised."},{status:401});}
}
