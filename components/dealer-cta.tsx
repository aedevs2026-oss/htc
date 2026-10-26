import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, BadgeCheck, Headset } from "lucide-react";

export function DealerCta() {
  return <section className="dealer-cta">
    <div className="dealer-image"><Image src="/images/showroom.webp" alt="Premium furniture showroom with curated international collections" fill sizes="(max-width: 768px) 100vw, 55vw" /></div>
    <div className="dealer-copy"><p className="eyebrow">Experience in person</p><h2>Good design<br /><em>feels different.</em></h2><p>Explore our network of authorised dealers and discover imported collections, materials and comfort in person.</p><Link className="button button-gold" href="/dealers">Find your nearest dealer <ArrowRight size={16} /></Link>
      <div className="dealer-benefits"><span><MapPin /> Multiple locations</span><span><BadgeCheck /> Authorised partners</span><span><Headset /> Expert guidance</span></div>
    </div>
  </section>;
}
