"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

export function EnquiryForm({ product = "", sku = "", defaultInterest = "Furniture enquiry" }: { product?: string; sku?: string; defaultInterest?: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit enquiry.");
      event.currentTarget.reset();
      setStatus({ type: "success", message: "Thank you. Your enquiry has been received by HTC." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  }
  return <form className="contact-form" onSubmit={submit}>
    <p className="eyebrow">Enquiry form</p><h2>How can we help?</h2>
    <input type="hidden" name="product" value={product}/><input type="hidden" name="sku" value={sku}/>
    <div className="form-row"><div><label htmlFor="enq-name">Your name</label><input id="enq-name" name="name" placeholder="Enter your name" autoComplete="name" maxLength={120} required/></div><div><label htmlFor="enq-email">Email address</label><input id="enq-email" type="email" name="email" placeholder="you@example.com" autoComplete="email" maxLength={180} required/></div></div>
    <div className="form-row"><div><label htmlFor="enq-phone">Phone number</label><input id="enq-phone" name="phone" type="tel" placeholder="+91" autoComplete="tel" maxLength={40}/></div><div><label htmlFor="enq-interest">I’m interested in</label><select id="enq-interest" name="interest" defaultValue={defaultInterest}><option>Furniture enquiry</option><option>Product quote</option><option>Find a dealer</option><option>Interior / project enquiry</option><option>Become a dealer</option><option>After-sales support</option><option>General enquiry</option></select></div></div>
    <div><label htmlFor="enq-company">Company (optional)</label><input id="enq-company" name="company" placeholder="Company / organisation" maxLength={160}/></div>
    <div><label htmlFor="enq-message">Tell us a little more</label><textarea id="enq-message" name="message" rows={5} placeholder="What are you looking for?" maxLength={3000} required/></div>
    <div className="sr-only" aria-hidden="true"><label htmlFor="enq-website">Leave this field empty</label><input id="enq-website" name="website" tabIndex={-1} autoComplete="off"/></div>
    <button className="button button-dark" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="animate-spin" size={16}/> Sending…</> : <>Send enquiry <ArrowRight size={16}/></>}</button>
    {status && <p role="status" className={status.type === "success" ? "enquiry-success" : "enquiry-error"}>{status.type === "success" && <CheckCircle2 size={16}/>} {status.message}</p>}
    <p className="form-note">Your details are used only to respond to this enquiry. HTC’s team will contact you using the details provided.</p>
  </form>;
}
