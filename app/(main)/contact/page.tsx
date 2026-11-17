import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryForm } from "@/components/enquiry-form";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string; sku?: string; subject?: string }> }) {
  const params = await searchParams;
  const product = params.product || "";
  const sku = params.sku || "";
  const defaultInterest = params.subject === "dealer" ? "Become a dealer" : product ? "Product quote" : "Furniture enquiry";
  return <>
    <section className="page-hero contact-hero"><Image src="/images/luxury-living-editorial.webp" alt="Welcoming premium furniture showroom and consultation space" fill priority sizes="100vw"/><div className="page-hero-overlay"/><div className="site-container page-hero-content"><p className="eyebrow">We would love to help</p><h1>Let’s find the<br/><em>right piece.</em></h1><p>Ask about a collection, find your nearest dealer or speak with our team about your project.</p><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Contact</div></div></section>
    <section className="section site-container contact-layout"><div className="contact-info"><p className="eyebrow">Get in touch</p><h2>Start a conversation.</h2><p>Share a little about what you are looking for and we will help direct your enquiry to the right team.</p><div className="contact-detail"><span><MapPin/></span><div><b>Visit a showroom</b><p>Find your nearest authorised HTC dealer.</p><Link href="/dealers">Explore dealer network <ArrowRight size={14}/></Link></div></div><div className="contact-detail"><span><Phone/></span><div><b>Call our team</b><p><a href="tel:+919840048449">+91 98400 48449</a><br/><a href="tel:+919940127381">+91 99401 27381</a></p></div></div><div className="contact-detail"><span><Mail/></span><div><b>Email us</b><p>Submit the form and our team will respond to your enquiry.</p></div></div><div className="contact-detail"><span><Clock/></span><div><b>Visit our warehouse</b><p>16/1, Gajapathy Chamber, Velapanchavady, Chennai – 600077</p></div></div></div><EnquiryForm product={product} sku={sku} defaultInterest={defaultInterest}/></section>
    <section className="faq-section" id="faq"><div className="site-container"><SectionHeading eyebrow="Helpful information" title="Frequently asked questions" description="A few starting points for your furniture enquiry."/><div className="faq-grid"><details><summary>Where can I see HTC furniture in person?</summary><p>Use the dealer finder to locate an authorised showroom. Contact HTC to confirm current showroom details.</p></details><details><summary>Can I customise materials or finishes?</summary><p>Options vary by product and brand. Contact the team to discuss available materials and finishes.</p></details><details id="delivery"><summary>How can I check delivery and installation?</summary><p>Delivery arrangements may vary by product and dealer. Ask your selected dealer for details.</p></details><details id="warranty"><summary>Where can I find warranty information?</summary><p>Request the applicable warranty details for the product and brand you are considering.</p></details></div></div></section>
  </>;
}
