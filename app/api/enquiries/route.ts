import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const clean = (value: unknown, max = 2000) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 120);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 40);
    const interest = clean(body.interest, 100);
    const message = clean(body.message, 3000);
    const product = clean(body.product, 240);
    const sku = clean(body.sku, 120);
    const company = clean(body.company, 160);
    if (body.website) return NextResponse.json({ ok: true });
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return NextResponse.json({ error: "Please provide your name, a valid email and a message." }, { status: 400 });
    const db = createServiceClient();
    if (!db) return NextResponse.json({ error: "Enquiry service is not configured. Please call HTC directly." }, { status: 503 });
    const { data, error } = await db.from("enquiries").insert({ name, email, phone: phone || null, interest: interest || "General enquiry", message, product: product || null, sku: sku || null, company: company || null, status: "new", source: "website" }).select("id").single();
    if (error) throw error;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);
    const to = process.env.ENQUIRY_TO_EMAIL || process.env.SMTP_USER;
    if (host && user && pass && to) {
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to,
        replyTo: email,
        subject: `HTC website enquiry: ${interest || "General"} — ${name}`,
        text: [`Enquiry ID: ${data.id}`, `Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, `Interest: ${interest || "General"}`, `Product: ${product || "—"}`, `SKU: ${sku || "—"}`, `Company: ${company || "—"}`, "", message].join("\n"),
      });
    } else {
      console.warn("SMTP is not configured; enquiry was saved in Supabase but no email was sent.");
    }
    return NextResponse.json({ ok: true, enquiryId: data.id });
  } catch (error) {
    console.error("Enquiry submission failed", error);
    return NextResponse.json({ error: "We could not submit your enquiry. Please try again or call HTC." }, { status: 500 });
  }
}
