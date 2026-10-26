import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = { title: string; sub: string; image: string; href: string; icon?: React.ElementType };
export function ImageCard({ title, sub, image, href, icon: Icon }: Props) {
  return <Link href={href} className="category-card">
    <Image src={`/images/${image}.webp`} alt={title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
    <span className="category-shade" />
    <span className="category-copy">{Icon && <Icon size={18} />}<b>{title}</b><small>{sub}</small></span>
    <span className="category-arrow"><ArrowUpRight size={15} /></span>
  </Link>;
}
