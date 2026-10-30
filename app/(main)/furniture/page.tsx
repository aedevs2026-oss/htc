import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { CatalogueClient } from "@/components/catalogue-client";
import { CatalogCategoryCard } from "@/components/catalog-category-card";
import { getCatalog } from "@/lib/catalog";
import { getHomeCategories, resolveCategoryFilter } from "@/lib/catalog-helpers";
import { getSiteConfig } from "@/lib/site-config";

export default async function FurniturePage({ searchParams }: { searchParams: Promise<{ category?: string; brand?: string; room?: string }> }) {
  const params = await searchParams;
  const [{ products, categories, source }, site] = await Promise.all([getCatalog(), getSiteConfig()]);
  const initialCategory = resolveCategoryFilter(params.category || params.room, categories);
  const initialBrand = params.brand ? products.find((p) => (p.brand || "HTC").toLowerCase() === params.brand!.toLowerCase())?.brand || "All brands" : "All brands";
  const topCategories = getHomeCategories(categories, site, 8);
  return <>
    <section className="page-hero furniture-hero"><Image src="/images/living-room-hero.webp" alt="High-end living room with a curved sofa, stone coffee table and warm timber details" fill priority sizes="100vw"/><div className="page-hero-overlay"/><div className="site-container page-hero-content"><p className="eyebrow">The HTC furniture catalogue</p><h1>Considered pieces.<br/><em>Beautifully lived in.</em></h1><p>Browse {products.length.toLocaleString("en-IN")}+ HTC product codes, published prices and categories from our live catalogue.</p><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Furniture</div></div></section>
    <section className="section site-container furniture-category-band"><SectionHeading eyebrow="Browse by category" title="Shop the range" description="Jump into a category or search the full catalogue below." compact/><div className="category-grid category-grid-compact">{topCategories.map((category)=><CatalogCategoryCard key={category.slug} category={category}/>)}</div></section>
    <section className="section site-container listing-section"><SectionHeading eyebrow="Search the catalogue" title="Find the right piece" description="Search by product name or code, filter by category, room and brand, and compare prices."/><CatalogueClient products={products} categories={categories} initialCategory={initialCategory} initialBrand={initialBrand}/><p className="catalogue-sync-note">Showing <strong>{products.length}</strong> products · Source: <strong>{source === "supabase" ? "Supabase" : "Local catalogue"}</strong> · <Link href="/admin">Admin panel</Link></p></section>
    <section className="quote-banner"><div><p className="eyebrow">Looking for something specific?</p><h2>Let our team help you find the right piece.</h2></div><Link href="/contact" className="button button-gold">Ask a furniture specialist</Link></section>
  </>;
}
