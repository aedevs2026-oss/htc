import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, BadgeCheck, Headset, Search, Store, Handshake, Globe2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { AutoLocateDealer } from "@/components/auto-locate-dealer";

const locations = [
  { city: "Chennai", name: "HTC Authorised Dealer", detail: "Contact the HTC team for current showroom details." },
  { city: "Coimbatore", name: "HTC Dealer Network", detail: "Ask about collections and product availability." },
  { city: "Bengaluru", name: "HTC Dealer Network", detail: "Connect with our team to find your nearest partner." }
];
export default function DealersPage() {
  return <>
    <section className="page-hero dealer-page-hero"><Image src="/images/showroom.webp" alt="Premium furniture showroom interior" fill priority sizes="100vw" /><div className="page-hero-overlay" /><div className="site-container page-hero-content"><p className="eyebrow">Experience it in person</p><h1>Good design feels<br /><em>different in person.</em></h1><p>Visit an authorised HTC dealer to explore imported collections, compare finishes and find expert guidance.</p><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Our dealers</div></div></section>
    <section className="section site-container"><AutoLocateDealer /><div className="dealer-search-layout"><div><p className="eyebrow">Your nearest showroom</p><h2>Find HTC near you.</h2><p className="section-description">Search by city or PIN code to begin. Dealer locations and contact information should be confirmed with HTC before launch.</p><form className="dealer-search" action="#dealer-results"><MapPin size={18} /><label className="sr-only" htmlFor="dealer-query">City or PIN code</label><input id="dealer-query" name="q" placeholder="Enter city or PIN code" /><button type="submit"><Search size={16} /> Search</button></form><div className="dealer-trust"><span><BadgeCheck /> Authorised partners</span><span><Headset /> Personal guidance</span><span><Store /> In-person experience</span></div></div><div className="dealer-search-photo"><Image src="/images/dining-room.webp" alt="Curated dining furniture displayed in a bright showroom" fill sizes="(max-width: 768px) 100vw, 45vw" /></div></div></section>
    <section className="dealer-results-section" id="dealer-results"><div className="site-container"><SectionHeading eyebrow="Dealer network" title="Start with a location" description="These are illustrative location cards. Replace them with verified dealer data and exact addresses." /><div className="dealer-location-grid">{locations.map((l) => <article className="dealer-location-card" key={l.city}><div className="location-icon"><MapPin /></div><p className="eyebrow">{l.city}</p><h3>{l.name}</h3><p>{l.detail}</p><Link href="/contact" className="text-link">Request dealer details <ArrowRight size={15} /></Link></article>)}</div></div></section>
    <section className="dealer-partner-section" id="partner"><div className="site-container partner-layout"><div><p className="eyebrow">Grow with HTC</p><h2>Become an<br /><em>authorised dealer.</em></h2><p>Bring considered international furniture and a premium customer experience to your market. Tell us about your business and our team can follow up.</p><Link href="/contact?subject=dealer" className="button button-gold">Partner with HTC <ArrowRight size={16} /></Link></div><div className="partner-benefits"><div><Handshake /><b>Brand partnership</b><span>Build a trusted retail relationship.</span></div><div><Globe2 /><b>Curated collections</b><span>Introduce customers to global design.</span></div><div><Headset /><b>Dedicated support</b><span>Connect with the HTC team.</span></div></div></div></section>
  </>;
}
