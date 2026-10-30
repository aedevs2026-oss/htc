import {SiteSettingsEditor} from "@/components/admin/site-settings-editor";
import {requireAdmin} from "@/lib/supabase/admin-guard";
export default async function SettingsPage(){const {supabase}=await requireAdmin();const {data}=await supabase.from("site_settings").select("key,value");return <><div className="admin-page-head"><div><p className="eyebrow">Storefront configuration</p><h1>Site settings</h1><p className="admin-muted">Manage contact details, SEO defaults and social links.</p></div></div><SiteSettingsEditor initial={Object.fromEntries((data||[]).map(x=>[x.key,x.value]))}/></>}
