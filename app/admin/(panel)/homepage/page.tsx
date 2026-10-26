import { getAdminCatalog } from "@/lib/catalog";
import { getSiteConfig } from "@/lib/site-config";
import { HomepageSettings } from "@/components/admin/homepage-settings";
import { FeaturedPicker } from "@/components/admin/featured-picker";

export default async function AdminHomepagePage() {
  const [config, catalog] = await Promise.all([getSiteConfig(), getAdminCatalog()]);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Storefront</p>
          <h1>Homepage &amp; collections</h1>
        </div>
      </div>
      <div className="admin-panels admin-panels-stack">
        <HomepageSettings config={config} />
        <FeaturedPicker products={catalog?.products || []} />
      </div>
    </>
  );
}
