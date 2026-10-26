import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { getCatalog } from "@/lib/catalog";
import { categoryImageSrc, getCollectionGroups, getFeaturedProducts } from "@/lib/catalog-helpers";
import { getSiteConfig } from "@/lib/site-config";

export default async function CollectionsPage() {
  const [catalog, site] = await Promise.all([getCatalog(), getSiteConfig()]);
  const { products, categories } = catalog;
  const collections = getCollectionGroups(categories, site, 4);
  const highlights = getFeaturedProducts(products, 8);

  return (
    <>
      <section className="page-hero collections-hero">
        <Image src="/images/showroom.webp" alt="A curated imported furniture collection in a warm showroom" fill priority sizes="100vw" />
        <div className="page-hero-overlay" />
        <div className="site-container page-hero-content">
          <p className="eyebrow">A world of considered design</p>
          <h1>Collections that<br /><em>feel like you.</em></h1>
          <p>Explore HTC categories — sofas, bedroom, dining, office and more — with real product codes and prices.</p>
          <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Collections</div>
        </div>
      </section>
      <section className="section site-container">
        <SectionHeading eyebrow="Curated for modern living" title="Explore our collections" description="Each collection groups products from the HTC catalogue by room and use." />
        <div className="collection-grid">
          {collections.map((item, i) => {
            const cover = categoryImageSrc(item);
            return (
              <Link href={`/furniture?category=${encodeURIComponent(item.slug)}`} className={`collection-card collection-card-${i}`} key={item.slug}>
                <div className="collection-image">
                  <Image src={cover} alt={item.name} fill sizes="(max-width: 640px) 100vw, 50vw" />
                </div>
                <div className="collection-copy">
                  <p className="eyebrow">{item.count ? `${item.count} products` : "Collection"}</p>
                  <h3>{item.name}</h3>
                  <p>{item.description || `Browse the ${item.name} range from HTC.`}</p>
                  <span>Explore collection <ArrowRight size={15} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="global-brands-section" id="brands">
        <div className="site-container">
          <div className="brand-intro">
            <div><p className="eyebrow">International perspective</p><h2>Good design<br /><em>knows no borders.</em></h2></div>
            <p>Explore global design partners represented across the HTC range.</p>
          </div>
          <div className="brand-logos brand-logos-large brand-icon-grid">
            {[{ name: "NATUZZI", src: "natuzzi.svg" }, { name: "calligaris", src: "calligaris.svg" }, { name: "Stressless", src: "stressless.svg" }, { name: "himolla", src: "himolla.svg" }, { name: "KOINOR", src: "koinor.svg" }, { name: "ROLF BENZ", src: "rolf-benz.svg" }, { name: "BoConcept", src: "boconcept.svg" }, { name: "ligne roset", src: "ligne-roset.svg" }].map((b) => (
              <div className="brand-icon-card" key={b.name} title={b.name}><Image src={`/brand/brands/${b.src}`} alt={b.name} width={88} height={80} /><span className="sr-only">{b.name}</span></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section site-container">
        <SectionHeading eyebrow="From the catalogue" title="Collection highlights" link="/furniture" linkText="View all furniture" />
        <div className="product-grid">
          {highlights.map((product) => (
            <ProductCard key={String(product.id)} product={product} href={`/furniture?category=${encodeURIComponent(product.categorySlugs?.[0] || product.category || "")}`} />
          ))}
        </div>
      </section>
      <section className="quote-banner">
        <div><p className="eyebrow">Made for your space</p><h2>Not sure where to begin? Talk to a furniture specialist.</h2></div>
        <Link href="/contact" className="button button-gold">Get personal guidance <ArrowRight size={16} /></Link>
      </section>
    </>
  );
}
