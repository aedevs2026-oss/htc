import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, description, link, linkText = "Explore", compact = false }: { eyebrow?: string; title: string; description?: string; link?: string; linkText?: string; compact?: boolean }) {
  return <div className={compact ? "section-heading section-heading-compact" : "section-heading"}>
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>
    {link && <Link className="text-link heading-link" href={link}>{linkText}<ArrowRight size={15} /></Link>}
  </div>;
}
