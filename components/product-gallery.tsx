import { useState } from "react";
import Image from "next/image";
import type { CatalogImage } from "@/lib/types/catalog";

const fallback = "/images/sofa-product.webp";
export function ProductGallery({ name, images }: { name: string; images: CatalogImage[] }) {
  const gallery = (images || []).filter((image) => image?.src?.startsWith("/") && !image.src.startsWith("//")).slice(0, 4);
  while (gallery.length < 4) gallery.push({ src: gallery[gallery.length - 1]?.src || fallback, alt: `${name} product view` });
  const [active, setActive] = useState(0);
  const selected = gallery[active] || gallery[0];
  return (
    <div className="product-gallery">
      <div className="product-gallery-main"><Image src={selected.src} alt={selected.alt || name} fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div>
      <div className="product-gallery-thumbs">{gallery.map((image, index) => <button key={image.src + index} type="button" onClick={() => setActive(index)} aria-label={`Show ${image.view || `view ${index + 1}`}`} aria-pressed={active === index}><Image src={image.src} alt={image.alt || name} width={88} height={88} /></button>)}</div>
    </div>
  );
}
