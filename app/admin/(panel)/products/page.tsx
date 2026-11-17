import { getAdminCatalog } from "@/lib/catalog";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function AdminProductsPage() {
  const catalog = await getAdminCatalog();
  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Products</h1>
        </div>
      </div>
      <ProductEditor products={catalog?.products || []} />
    </>
  );
}
