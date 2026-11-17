"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { CatalogCategory } from "@/lib/types/catalog";
import { updateCategoryAction } from "@/app/admin/actions";

export function CategoryEditor({ categories }: { categories: CatalogCategory[] }) {
  const [selectedSlug, setSelectedSlug] = useState(categories[0]?.slug || "");
  const selected = categories.find((c) => c.slug === selectedSlug) || categories[0];
  const [form, setForm] = useState(() => toForm(selected));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toForm(category?: CatalogCategory) {
    return {
      name: category?.name || "",
      description: category?.description || "",
      imagePath: category?.image || "",
      sortOrder: "0",
    };
  }

  function pick(slug: string) {
    setSelectedSlug(slug);
    const category = categories.find((c) => c.slug === slug);
    setForm(toForm(category));
    setMessage(null);
  }

  function save() {
    if (!selected) return;
    startTransition(async () => {
      try {
        await updateCategoryAction({ slug: selected.slug, ...form });
        setMessage("Saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save.");
      }
    });
  }

  if (!categories.length) {
    return <div className="admin-empty"><p>No categories yet. Sync and seed the catalogue first.</p></div>;
  }

  const imageSrc = form.imagePath?.startsWith("/") ? form.imagePath : "/images/living-room-hero.webp";

  return (
    <div className="admin-category-layout">
      <div className="admin-category-grid">
        {categories.map((category) => (
          <button key={category.slug} type="button" className={category.slug === selectedSlug ? "admin-category-card active" : "admin-category-card"} onClick={() => pick(category.slug)}>
            <div className="admin-category-thumb">
              <Image src={category.image?.startsWith("/") ? category.image : imageSrc} alt={category.name} width={120} height={90} />
            </div>
            <div>
              <strong>{category.name}</strong>
              <span>{category.count ?? 0} products</span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <section className="admin-panel admin-category-form">
          <h2>Edit {selected.name}</h2>
          <div className="admin-form-grid">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <label>
              Sort order
              <input inputMode="numeric" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </label>
            <label className="admin-span-2">
              Cover image path
              <input value={form.imagePath} onChange={(e) => setForm((f) => ({ ...f, imagePath: e.target.value }))} placeholder="/images/categories/bedroom.jpg" />
            </label>
            <label className="admin-span-2">
              Description
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
          </div>
          <div className="admin-editor-actions">
            <button type="button" className="button button-dark" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save category"}</button>
            {message && <p className="admin-message">{message}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
