import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, BadgeCheck, Headset, Store, Handshake, Globe2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryForm } from "@/components/enquiry-form";
import { createClient } from "@/lib/supabase/server";

type Dealer = { id:string; name:string; city:string; state:string; pincode:string|null; address:string|null; phone:string|null; email:string|null; website:string|null; description:string|null; is_authorised:boolean };
export default async function DealersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0,80);
  const supabase = await createClient();
  let dealers: Dealer[] = [];
  if (supabase) {
    let query = supabase.from("dealers").select("id,name,city,state,pincode,address,phone,email,website,description,is_authorised").eq("is_active",true).order("city").limit(100);
    if (q) query = query.or(`city.ilike.%${q.replace(/[%_,]/g,"")}%,pincode.ilike.%${q.replace(/[%_,]/g,"")}%,name.ilike.%${q.replace(/[%_,]/g,"")}%`);
    const result = await query;
    dealers = (result.data || []) as Dealer[];
  }
  return <>
    <section className="page-hero dealer-page-hero"><Image src="/images/luxury-living-editorial.webp" alt="Premium furniture showroom with curated living spaces and warm ambient lighting" fill priority sizes="100vw"/><div className="page-hero-overlay"/><div className="site-container page-hero-content"><p className="eyebrow">Experience it in person</p><h1>Good design feels<br/><em>different in person.</em></h1><p>Visit an authorised HTC dealer to explore imported collections, compare finishes and find expert guidance.</p><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Our dealers</div></div></section>
    <section className="section site-container"><div className="dealer-search-layout"><div><p className="eyebrow">Your nearest showroom</p><h2>Find HTC near you.</h2><p className="section-description">Search by city or PIN code to find a verified dealer location.</p><form className="dealer-search" action="/dealers" method="get"><MapPin size={18}/><label className="sr-only" htmlFor="dealer-query">City or PIN code</label><input id="dealer-query" name="q" defaultValue={q} placeholder="Enter city or PIN code"/><button type="submit">Search</button></form><div className="dealer-trust"><span><BadgeCheck/> Authorised partners</span><span><Headset/> Personal guidance</span><span><Store/> In-person experience</span></div></div><div className="dealer-search-photo"><Image src="/images/showroom.webp" alt="Curated furniture displayed in a premium showroom" fill sizes="(max-width: 768px) 100vw, 45vw"/></div></div></section>
    <section className="dealer-results-section" id="dealer-results"><div className="site-container"><SectionHeading eyebrow="Verified dealer network" title={dealers.length ? "Explore authorised dealers." : "Dealer details are coming soon."} description={dealers.length ? "Contact a showroom to confirm product availability and visit timings." : "The live dealer directory will appear here once HTC adds verified partner records in Supabase. We do not show sample locations as real dealers."}/>{dealers.length ? <div className="dealer-location-grid">{dealers.map((d)=><article className="dealer-location-card" key={d.id}><div className="location-icon"><MapPin/></div><p className="eyebrow">{d.city}, {d.state}</p><h3>{d.name}</h3>{d.is_authorised && <span className="dealer-authorised"><BadgeCheck size={14}/> Authorised HTC partner</span>}<p>{[d.address,d.pincode].filter(Boolean).join(", ")}</p>{d.description && <p>{d.description}</p>}{d.phone && <a href={`tel:${d.phone.replace(/[^+\d]/g,"")}`}>{d.phone}</a>}{d.email && <a href={`mailto:${d.email}`}>{d.email}</a>}{d.website && <a href={d.website} target="_blank" rel="noreferrer">Dealer website <ArrowRight size={14}/></a>}</article>)}</div> : <div className="dealer-empty"><Store size={30}/><p>Need help finding a showroom? Send us your city or PIN code and the HTC team can guide you.</p><Link className="button button-dark" href="/contact?subject=dealer">Request dealer details <ArrowRight size={15}/></Link></div>}</div></section>
    <section className="dealer-partner-section" id="partner"><div className="site-container partner-layout"><div><p className="eyebrow">Grow with HTC</p><h2>Become an<br/><em>authorised dealer.</em></h2><p>Tell us about your furniture business and location. Our team can review your partnership enquiry.</p><Link href="/contact?subject=dealer" className="button button-gold">Partner with HTC <ArrowRight size={16}/></Link></div><div className="partner-benefits"><div><Handshake/><b>Brand partnership</b><span>Build a trusted retail relationship.</span></div><div><Globe2/><b>Curated collections</b><span>Introduce customers to global design.</span></div><div><Headset/><b>Dedicated support</b><span>Connect with the HTC team.</span></div></div></div></section>
    <section className="section site-container"><EnquiryForm defaultInterest="Become a dealer"/></section>
  </>;
}
