import {redirect} from "next/navigation";
import {Suspense} from "react";
import {AdminLoginForm} from "@/components/admin/login-form";
import {createClient} from "@/lib/supabase/server";
export default async function AdminLoginPage(){const supabase=await createClient();if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){const {data:admin}=await supabase.from("admin_users").select("is_active").eq("user_id",user.id).maybeSingle();if(admin?.is_active)redirect("/admin");}}return <div className="admin-login-page"><Suspense><AdminLoginForm/></Suspense></div>}
