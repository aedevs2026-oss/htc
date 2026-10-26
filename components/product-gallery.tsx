"use client";

import Image from "next/image";
import { useState } from "react";
import type { CatalogImage } from "@/lib/types/catalog";

const fallback = "/images/sofa-product.webp";
export function ProductGallery({ name, images }: { name: string; images: CatalogImage[] }) {
  const gallery = (images || []).filter((image) => image?.src?.startsWith("/") && !image.src.startsWith("//")).slice(0, 4);
  while (gallery.length < 4) gallery.push({ src: gallery[gallery.length - 1]?.src || fallback, alt: `${name} product view` });
  const [active, setActive] = useState(0);
  const selected = gallery[active] || gallery[0];
  return <div className="product-detail-gallery">
    <div className="product-detail-main-image">
      <Image key={selected.src} src={selected.src || fallback} alt={selected.alt || name} fill priority sizes="(max-width: 850px) 100vw, 55vw" />
      <span className="product-detail-image-label">HTC · Curated collection</span>
      <span className="product-gallery-count">0{active + 1} <i>/ 04</i></span>
    </div>
    <div className="product-detail-thumbs" role="tablist" aria-label={`${name} product images`}>
      {gallery.map((image, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} key={`${image.src}-${index}`} onClick={() => setActive(index)} aria-label={`Show ${image.view || `image ${index + 1}`}`}>
        <Image src={image.src || fallback} alt={image.alt || `${name} view ${index + 1}`} fill sizes="120px" />
        <span>{image.view || ["Main view", "Alternate crop", "Detail crop", "Alternate framing"][index]}</span>
      </button>)}
    </div>
  </div>;
}
