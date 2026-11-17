import { getAdminCatalog } from "@/lib/catalog";
import { CategoryEditor } from "@/components/admin/category-editor";

export default async function AdminCategoriesPage() {
  const catalog = await getAdminCatalog();
  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Categories</h1>
        </div>
      </div>
      <CategoryEditor categories={catalog?.categories || []} />
    </>
  );
}
