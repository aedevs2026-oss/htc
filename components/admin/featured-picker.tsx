"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import type { CatalogProduct } from "@/lib/types/catalog";
import { productImageSrc, formatInr } from "@/lib/catalog-helpers";
import { setFeaturedProductAction } from "@/app/admin/actions";

export function FeaturedPicker({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => [p.name, p.sku, p.category, ...(p.categories || [])].join(" ").toLowerCase().includes(q));
  }, [products, query]);

  const featuredCount = products.filter((p) => p.isFeatured).length;

  function toggle(product: CatalogProduct) {
    startTransition(async () => {
      try {
        await setFeaturedProductAction(Number(product.id), !product.isFeatured);
        setMessage(`${product.isFeatured ? "Removed" : "Added"} ${product.name} from homepage highlights.`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not update featured product.");
      }
    });
  }

  return (
    <section className="admin-panel">
      <h2>Featured products ({featuredCount})</h2>
      <p className="admin-muted">Starred products appear on the home page and collections highlights. Up to 8 are shown.</p>
      <label className="admin-search admin-search-inline">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search to feature products" />
      </label>
      <ul className="admin-feature-list">
        {filtered.slice(0, 80).map((product) => (
          <li key={String(product.id)}>
            <div className="admin-feature-row">
              <Image src={productImageSrc(product)} alt="" width={48} height={48} className="admin-feature-thumb" />
              <div>
                <strong>{product.name}</strong>
                <span>{product.price != null ? formatInr(product.price) : "Price on request"} · {(product.categories || []).slice(0, 1).join("")}</span>
              </div>
              <button
                type="button"
                className={product.isFeatured ? "admin-star active" : "admin-star"}
                onClick={() => toggle(product)}
                disabled={pending}
                aria-label={product.isFeatured ? "Remove from featured" : "Add to featured"}
              >
                <Star size={18} fill={product.isFeatured ? "currentColor" : "none"} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {message && <p className="admin-message">{message}</p>}
    </section>
  );
}
