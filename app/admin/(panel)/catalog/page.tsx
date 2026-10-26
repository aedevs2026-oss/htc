import Link from "next/link";
import { getSyncReport } from "@/lib/sync-report";
import { getAdminCatalog } from "@/lib/catalog";

export default async function AdminCatalogPage() {
  const [report, catalog] = await Promise.all([getSyncReport(), getAdminCatalog()]);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Data</p>
          <h1>Catalogue sync</h1>
        </div>
      </div>
      <div className="admin-panels admin-panels-stack">
        <section className="admin-panel">
          <h2>Current catalogue</h2>
          <p className="admin-muted">Source: <strong>{catalog?.source === "supabase" ? "Supabase" : "Local JSON"}</strong></p>
          <ul className="admin-kv">
            <li><span>Products loaded</span><strong>{catalog?.products.length ?? 0}</strong></li>
            <li><span>Categories</span><strong>{catalog?.categories.length ?? 0}</strong></li>
            <li><span>Featured (homepage)</span><strong>{catalog?.products.filter((p) => p.isFeatured).length ?? 0}</strong></li>
          </ul>
        </section>
        <section className="admin-panel">
          <h2>Last sync from htcfurniture.in</h2>
          {report ? (
            <>
              <p className="admin-muted">Synced {new Date(report.syncedAt).toLocaleString("en-IN")}</p>
              <ul className="admin-kv">
                <li><span>Products</span><strong>{report.products}</strong></li>
                <li><span>With price</span><strong>{report.withPrice}</strong></li>
                <li><span>Product images</span><strong>{report.downloadedProductImages}</strong></li>
                <li><span>Category images</span><strong>{report.downloadedCategoryImages}</strong></li>
              </ul>
            </>
          ) : (
            <p className="admin-muted">No sync report yet. Run <code>npm run sync:catalog</code> from the project root.</p>
          )}
          <ol className="admin-steps">
            <li>Run <code>npm run sync:catalog</code> to refresh JSON and images.</li>
            <li>Run <code>npm run seed:supabase</code> after Supabase is configured.</li>
            <li>Use <Link href="/admin/products">Products</Link> and <Link href="/admin/homepage">Homepage</Link> to fine-tune the storefront.</li>
          </ol>
        </section>
      </div>
    </>
  );
}
