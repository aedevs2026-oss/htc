import Link from "next/link";
import { getAdminCatalog } from "@/lib/catalog";
import { Package, Tags, IndianRupee, ImageIcon } from "lucide-react";

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default async function AdminDashboardPage() {
  const catalog = await getAdminCatalog();
  const products = catalog?.products || [];
  const categories = catalog?.categories || [];
  const priced = products.filter((p) => p.price != null).length;
  const withImages = products.filter((p) => p.image && !p.image.includes("sofa-product")).length;
  const avg = priced ? products.reduce((sum, p) => sum + (p.price || 0), 0) / priced : 0;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Catalogue dashboard</h1>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/products" className="button button-dark">Manage products</Link>
        </div>
      </div>
      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <Package size={20} />
          <strong>{products.length}</strong>
          <span>Products</span>
        </article>
        <article className="admin-stat-card">
          <Tags size={20} />
          <strong>{categories.length}</strong>
          <span>Categories</span>
        </article>
        <article className="admin-stat-card">
          <IndianRupee size={20} />
          <strong>{priced}</strong>
          <span>With live price</span>
        </article>
        <article className="admin-stat-card">
          <ImageIcon size={20} />
          <strong>{withImages}</strong>
          <span>Local images</span>
        </article>
      </div>
      <div className="admin-panels">
        <section className="admin-panel">
          <h2>Price snapshot</h2>
          <p>Average listed price across priced products: <strong>{money(avg)}</strong></p>
          <p className="admin-muted">Run <code>npm run sync:catalog</code> to refresh from htcfurniture.in, then <code>npm run seed:supabase</code> to push into Supabase.</p>
        </section>
        <section className="admin-panel">
          <h2>Quick links</h2>
          <ul className="admin-link-list">
            <li><Link href="/admin/products">Edit product prices &amp; images</Link></li>
            <li><Link href="/admin/categories">Category names &amp; cover images</Link></li>
            <li><Link href="/admin/homepage">Homepage stats &amp; featured products</Link></li>
            <li><Link href="/admin/catalog">Catalogue sync status</Link></li>
            <li><Link href="/furniture">Preview public furniture catalogue</Link></li>
          </ul>
        </section>
      </div>
    </>
  );
}
