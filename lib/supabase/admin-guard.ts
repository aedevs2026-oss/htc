import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthenticated.");
  const { data: admin, error: adminError } = await supabase
    .from("admin_users").select("user_id, role, is_active").eq("user_id", user.id).maybeSingle();
  if (adminError || !admin || admin.is_active !== true) throw new Error("Forbidden: admin access required.");
  return { supabase, user, admin };
}
