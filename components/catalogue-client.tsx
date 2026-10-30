"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ArrowUpRight, PackageSearch } from "lucide-react";
import type { CatalogProduct as Product } from "@/lib/types/catalog";

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function CatalogueClient({ products, categories, initialCategory = "All furniture", initialBrand = "All brands" }: {
  products: Product[];
  categories: { name: string; count?: number; slug?: string }[];
  initialCategory?: string;
  initialBrand?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [sort, setSort] = useState("featured");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => { setCategory(initialCategory); setBrand(initialBrand); }, [initialCategory, initialBrand]);

  const categoryNames = useMemo(() => ["All furniture", ...Array.from(new Set([
    ...categories.map((item) => item.name), ...products.flatMap((item) => item.categories || [item.category || ""]),
  ])).filter(Boolean).sort((a, b) => a.localeCompare(b))], [categories, products]);
  const brandNames = useMemo(() => ["All brands", ...Array.from(new Set(products.map((p) => p.brand || "HTC"))).filter(Boolean).sort()], [products]);

  const filtered = useMemo(() => {
    let list = products.filter((product) => {
      const searchable = [product.displayName, product.name, product.sku, product.category, product.brand, ...(product.categories || [])].join(" ").toLowerCase();
      const matchesCategory = category === "All furniture" || (product.categories || [product.category]).some((item) => item === category);
      const matchesBrand = brand === "All brands" || (product.brand || "HTC") === brand;
      const price = Number(product.price || 0);
      return searchable.includes(query.toLowerCase()) && matchesCategory && matchesBrand && (!min || price >= Number(min)) && (!max || price <= Number(max));
    });
    if (sort === "featured") list = [...list].sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || (a.displayName || a.name).localeCompare(b.displayName || b.name));
    if (sort === "price-low") list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-high") list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "name") list = [...list].sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
    return list;
  }, [products, query, category, brand, sort, min, max]);

  const clear = () => { setQuery(""); setCategory("All furniture"); setBrand("All brands"); setMin(""); setMax(""); setSort("featured"); };
  return <>
    <div className="catalogue-controls">
      <label className="catalogue-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product, SKU, category or brand" aria-label="Search products"/><kbd>⌕</kbd></label>
      <div className="catalogue-control-actions"><label className="sort-select"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name A–Z</option></select></label><button className={`filter-button ${filtersOpen ? "filter-button-active" : ""}`} onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}><SlidersHorizontal size={16}/> Filters <span>{[category !== "All furniture", brand !== "All brands", !!min, !!max].filter(Boolean).length || ""}</span></button></div>
    </div>
    <div className="catalogue-category-chips" aria-label="Filter by category">{categoryNames.slice(0, 11).map((c) => <button key={c} onClick={() => setCategory(c)} className={category === c ? "filter-chip selected" : "filter-chip"}>{c}</button>)}</div>
    {filtersOpen && <div className="catalogue-filter-panel"><div className="filter-panel-heading"><div><p className="eyebrow">Refine your search</p><h3>Filters</h3></div><button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18}/></button></div><div className="filter-panel-fields"><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{categoryNames.map((c) => <option key={c}>{c}</option>)}</select></label><label>Brand<select value={brand} onChange={(e) => setBrand(e.target.value)}>{brandNames.map((b) => <option key={b}>{b}</option>)}</select></label><label>Minimum price (₹)<input inputMode="numeric" type="number" min="0" value={min} onChange={(e) => setMin(e.target.value)} placeholder="No minimum"/></label><label>Maximum price (₹)<input inputMode="numeric" type="number" min="0" value={max} onChange={(e) => setMax(e.target.value)} placeholder="No maximum"/></label></div><button className="button button-outline filter-clear" onClick={clear}>Clear all filters</button></div>}
    <div className="catalogue-result-line"><p><strong>{filtered.length.toLocaleString("en-IN")}</strong> products shown <span>·</span> Browse by room, category or brand.</p>{(query || category !== "All furniture" || brand !== "All brands" || min || max) && <button onClick={clear}>Clear filters <X size={13}/></button>}</div>
    {filtered.length ? <div className="product-grid listing-grid">{filtered.map((p) => {
      const title = p.displayName || p.name;
      const image = p.image || p.images?.[0]?.src || "/images/sofa-product.webp";
      const src = image.startsWith("/") && !image.startsWith("//") ? image : "/images/sofa-product.webp";
      const href = `/product/${p.slug || p.id}`;
      return <article className="product-card catalogue-product-card" key={p.id}><Link href={href} className="product-image" aria-label={`View ${title}`}><Image src={src} alt={p.images?.[0]?.alt || title} fill sizes="(max-width: 640px) 50vw,(max-width: 1024px) 33vw,25vw"/><span className="product-tag">{p.sku || "HTC COLLECTION"}</span><span className="product-open"><ArrowUpRight size={17}/></span></Link><div className="product-info"><p>{p.brand || "HTC"} · {(p.categories || [p.category || "Furniture"]).slice(0, 1).join("")}</p><Link href={href} className="catalogue-product-title">{title}</Link><strong className="catalogue-price">{p.price != null ? money(p.price) : "Price on request"}</strong><Link className="catalogue-enquiry-link" href={`/contact?product=${encodeURIComponent(title)}&sku=${encodeURIComponent(p.sku || "")}`}><span>Enquire about this item</span><ArrowUpRight size={15}/></Link></div></article>;
    })}</div> : <div className="catalogue-empty"><PackageSearch size={34}/><h3>No matching products</h3><p>Try another product code, category, room or brand.</p><button className="button button-dark" onClick={clear}>Reset filters</button></div>}
  </>;
}
