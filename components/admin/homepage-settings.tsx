"use client";

import { useState, useTransition } from "react";
import type { SiteConfig } from "@/lib/site-config";
import { saveSiteConfigAction } from "@/app/admin/actions";

export function HomepageSettings({ config }: { config: SiteConfig }) {
  const [form, setForm] = useState(config);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await saveSiteConfigAction(form);
        setMessage("Homepage settings saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save settings.");
      }
    });
  }

  return (
    <section className="admin-panel">
      <h2>Homepage highlights</h2>
      <p className="admin-muted">These values appear in the hero and stats sections on the home page.</p>
      <div className="admin-form-grid">
        <label>
          Global brands (hero)
          <input value={form.heroStats.brands} onChange={(e) => setForm((f) => ({ ...f, heroStats: { ...f.heroStats, brands: e.target.value } }))} />
        </label>
        <label>
          Unique designs (hero)
          <input value={form.heroStats.designs} onChange={(e) => setForm((f) => ({ ...f, heroStats: { ...f.heroStats, designs: e.target.value } }))} />
        </label>
        <label>
          Dealer partners (hero)
          <input value={form.heroStats.dealers} onChange={(e) => setForm((f) => ({ ...f, heroStats: { ...f.heroStats, dealers: e.target.value } }))} />
        </label>
        <label className="admin-span-2">
          Shop-by-category slugs (comma-separated)
          <input
            value={form.spotlightCategorySlugs.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                spotlightCategorySlugs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }))
            }
            placeholder="sofa, bedroom, dining, office-furniture"
          />
        </label>
        <label className="admin-span-2">
          Collections page slugs (comma-separated)
          <input
            value={form.collectionSlugs.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                collectionSlugs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }))
            }
            placeholder="sofa, bedroom, dining, new"
          />
        </label>
      </div>
      <div className="admin-editor-actions">
        <button type="button" className="button button-dark" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save homepage settings"}</button>
        {message && <p className="admin-message">{message}</p>}
      </div>
    </section>
  );
}
