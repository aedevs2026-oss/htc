import {ProductCreateForm} from "@/components/admin/product-create-form";
import {requireAdmin} from "@/lib/supabase/admin-guard";
export const dynamic = "force-dynamic";
export default async function NewProductPage(){const {supabase}=await requireAdmin();const {data}=await supabase.from("categories").select("slug,name").order("name");return <><div className="admin-page-head"><div><p className="eyebrow">Catalogue</p><h1>Add product</h1></div></div><ProductCreateForm categories={data||[]}/></>}
