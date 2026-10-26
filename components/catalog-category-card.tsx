import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CatalogCategory } from "@/lib/types/catalog";
import { categoryImageSrc } from "@/lib/catalog-helpers";


export function CatalogCategoryCard({ category }: { category: CatalogCategory }) {
  const src = categoryImageSrc(category);
  const countLabel = category.count ? `${category.count} products` : "Explore range";
  return (
    <Link href={`/furniture?category=${encodeURIComponent(category.slug)}`} className="category-card">
      <Image src={src} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
      <span className="category-shade" />
      <span className="category-copy">
        <b>{category.name}</b>
        <small>{countLabel}</small>
      </span>
      <span className="category-arrow"><ArrowUpRight size={15} /></span>
    </Link>
  );
}
