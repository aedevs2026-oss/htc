import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { formatInr, productImageSrc } from "@/lib/catalog-helpers";
import type { CatalogProduct } from "@/lib/types/catalog";

type LegacyProps = { title: string; category: string; image: string; tag: string; price?: number | null; href?: string };

function resolveLegacyImage(image: string) {
  if (image.startsWith("/")) return image;
  return `/images/${image}.webp`;
}

function ProductCardContent({ title, category, image, tag, price, href, description }: {
  title: string; category: string; image: string; tag: string; price?: number | null; href: string; description?: string;
}) {
  return <article className="product-card">
    <Link href={href} className="product-image" aria-label={`View ${title}`}>
      <Image src={image} alt={title} fill sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw" />
      <span className="product-tag"><Sparkles size={11} />{tag}</span>
      <span className="product-heart" aria-hidden="true"><Heart size={16} /></span>
      <span className="product-open"><ArrowUpRight size={16} /></span>
      <span className="product-image-caption">Designed for considered living</span>
    </Link>
    <div className="product-info">
      <div className="product-meta-row"><p>{category}</p><span>HTC EDITION</span></div>
      <Link href={href} className="product-title-link"><h3>{title}</h3></Link>
      {description && <p className="product-description">{description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}</p>}
      <div className="product-bottom-row">
        <div className="product-price-wrap">{price != null ? <><small>Price from</small><strong className="catalogue-price">{formatInr(price)}</strong></> : <><small>For pricing & finishes</small><strong className="catalogue-price product-price-enquire">Enquire with HTC</strong></>}</div>
        <Link className="product-link" href={`/contact?product=${encodeURIComponent(title)}`} aria-label={`Enquire about ${title}`}><ArrowUpRight size={17} /></Link>
      </div>
    </div>
  </article>;
}

export function ProductCard(props: LegacyProps | { product: CatalogProduct; tag?: string; href?: string }) {
  if ("product" in props) {
    const { product, tag, href = `/product/${product.slug || product.id}` } = props;
    const label = tag || (product.isFeatured ? "Curated pick" : product.sku ? `Ref. ${product.sku}` : "HTC collection");
    const category = (product.categories || [product.category || "Furniture"]).slice(0, 2).join(" · ");
    const description = product.shortDescription || product.description || "Thoughtfully selected design, refined materials and enduring comfort for your space.";
    return <ProductCardContent title={product.displayName || product.name} category={category} image={productImageSrc(product)} tag={label} price={product.price} href={href} description={description} />;
  }
  const { title, category, image, tag, price, href = "/furniture" } = props;
  return <ProductCardContent title={title} category={category} image={resolveLegacyImage(image)} tag={tag} price={price} href={href} description="A considered design with a refined silhouette and everyday comfort." />;
}
