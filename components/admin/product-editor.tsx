"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { CatalogProduct } from "@/lib/types/catalog";
import { updateProductAction } from "@/app/admin/actions";

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function toForm(product?: CatalogProduct) {
  return {
    name: product?.name || "",
    sku: product?.sku || "",
    price: product?.price != null ? String(product.price) : "",
    imagePath: product?.image || "",
    stockStatus: product?.stockStatus || "in_stock",
    isPublished: product?.isPublished !== false,
    isFeatured: Boolean(product?.isFeatured),
    description: product?.description || "",
  };
}

export function ProductEditor({ products }: { products: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(products[0]?.id != null ? Number(products[0].id) : null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => [p.name, p.sku, p.category, ...(p.categories || [])].join(" ").toLowerCase().includes(q));
  }, [products, query]);

  const selected = products.find((p) => Number(p.id) === selectedId) || filtered[0];
  const [form, setForm] = useState(() => toForm(selected));

  function selectProduct(product: CatalogProduct) {
    setSelectedId(Number(product.id));
    setForm(toForm(product));
    setMessage(null);
  }

  function save() {
    if (!selected) return;
    startTransition(async () => {
      try {
        await updateProductAction({ wpId: Number(selected.id), ...form });
        setMessage("Saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save.");
      }
    });
  }

  if (!products.length) {
    return (
      <div className="admin-empty">
        <p>No products in Supabase yet. Run catalogue sync and <code>npm run seed:supabase</code>.</p>
      </div>
    );
  }

  const imageSrc = form.imagePath?.startsWith("/") ? form.imagePath : "/images/sofa-product.webp";

  return (
    <div className="admin-split">
      <div className="admin-list-pane">
        <label className="admin-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" />
        </label>
        <ul className="admin-list">
          {filtered.slice(0, 120).map((product) => (
            <li key={String(product.id)}>
              <button type="button" className={Number(product.id) === Number(selected?.id) ? "active" : ""} onClick={() => selectProduct(product)}>
                <span>{product.name}</span>
                <small>{product.price != null ? money(product.price) : "No price"}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-editor-pane">
        {selected && (
          <>
            <div className="admin-editor-preview">
              <Image src={imageSrc} alt={form.name} width={320} height={320} className="admin-product-thumb" />
              <div>
                <h2>{selected.name}</h2>
                <p className="admin-muted">{(selected.categories || []).join(" · ")}</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label>
                Display name
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                SKU / code
                <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </label>
              <label>
                Price (INR)
                <input inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </label>
              <label>
                Image path (public folder)
                <input value={form.imagePath} onChange={(e) => setForm((f) => ({ ...f, imagePath: e.target.value }))} placeholder="/images/products/example.webp" />
              </label>
              <label>
                Stock status
                <select value={form.stockStatus} onChange={(e) => setForm((f) => ({ ...f, stockStatus: e.target.value }))}>
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                Published on website
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                Featured
              </label>
              <label className="admin-span-2">
                Description
                <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
            </div>
            <div className="admin-editor-actions">
              <button type="button" className="button button-dark" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save product"}</button>
              {message && <p className="admin-message">{message}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
