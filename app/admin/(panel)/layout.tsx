import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export default async function AdminPanelLayout({children}:{children:React.ReactNode}) {
 try { const {user}=await requireAdmin(); return <AdminShell email={user.email}>{children}</AdminShell>; }
 catch { redirect("/admin/login"); }
}
