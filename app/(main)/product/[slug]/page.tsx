import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Box, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { formatInr, productImageSrc } from "@/lib/catalog-helpers";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalog();
  const product = products.find((item) => item.slug === slug || String(item.id) === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id && ((item.category && item.category === product.category) || item.categories?.some((cat) => product.categories?.includes(cat)))).slice(0, 4);
  const src = productImageSrc(product);
  const displayName = product.displayName || product.name;
  const productImages = (product.images || []).slice(0, 4);
  return <>
    <div className="site-container product-breadcrumb"><Link href="/furniture"><ArrowLeft size={14}/> Back to furniture</Link><span>/</span><span>{product.categories?.[0] || product.category || "Furniture"}</span><span>/</span><span>{displayName}</span></div>
    <section className="site-container product-detail-layout">
      <ProductGallery name={displayName} images={productImages.length ? productImages : [{src}]}/>
      <div className="product-detail-copy"><div className="product-detail-kicker"><span>HTC COLLECTION</span><span><CheckCircle2 size={14}/> Carefully selected design</span></div><h1>{displayName}</h1><p className="product-detail-subtitle">{product.categories?.slice(0, 2).join(" · ") || product.category || "Furniture"}</p><p className="product-detail-description">{product.description?.trim() || `Discover ${displayName}, selected for its thoughtful design and everyday functionality. Contact our team for current availability, finish options and product specifications.`}</p><div className="product-detail-price-row">{product.price != null ? <><strong>{formatInr(product.price)}</strong><small>Catalogue price · confirm current price with HTC</small></> : <><strong>Price on request</strong><small>Ask our team for availability and a quote</small></>}</div><div className="product-detail-actions"><Link href={`/contact?product=${encodeURIComponent(displayName)}`} className="button button-dark">Enquire about this piece <ArrowRight size={16}/></Link><Link href="/dealers" className="button button-light"><MapPin size={16}/> Find a dealer</Link></div><div className="product-detail-assurance"><div><ShieldCheck/><span><b>Trusted selection</b><small>Curated furniture collections</small></span></div><div><Box/><span><b>Availability support</b><small>Confirm with our team</small></span></div><div><Sparkles/><span><b>Design guidance</b><small>Help choosing the right piece</small></span></div></div><div className="product-specs"><div><span>Product code</span><b>{product.sku || String(product.id)}</b></div><div><span>Category</span><b>{product.categories?.[0] || product.category || "Furniture"}</b></div><div><span>Availability</span><b>{product.stockStatus === "out_of_stock" ? "Please enquire" : "Confirm with dealer"}</b></div></div><p className="product-detail-note"><BadgeCheck size={15}/> Product imagery and catalogue information are indicative. Please confirm finish, dimensions and availability before purchase.</p></div>
    </section>
    <section className="product-detail-story"><div className="site-container product-story-inner"><div><p className="eyebrow">Thoughtfully considered</p><h2>A piece for the way<br/><em>you live.</em></h2><p>Explore the product in person, discuss materials and dimensions, and get guidance from the HTC team before making your choice.</p><Link className="text-link" href="/contact">Talk to a furniture specialist <ArrowRight size={15}/></Link></div><div className="product-story-image"><Image src="/images/living-room-hero.webp" alt="Warm contemporary living space" fill sizes="(max-width: 768px) 100vw, 50vw"/></div></div></section>
    {related.length > 0 && <section className="section site-container"><div className="section-heading"><div><p className="eyebrow">You may also like</p><h2>Explore similar pieces.</h2></div><Link className="text-link" href="/furniture">View all furniture <ArrowRight size={15}/></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={String(item.id)} product={item}/>)}</div></section>}
  </>;
}
