"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import products from "@/data/products.json";

type Product = (typeof products)[number];
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  link?: { href: string; label: string };
};

const suggestedQuestions = ["Product details", "Price & availability", "Dimensions & materials", "Find a dealer"];

function contactLink(product?: Product) {
  const params = new URLSearchParams();
  if (product) {
    params.set("product", product.displayName || product.name);
    if (product.sku) params.set("sku", product.sku);
  }
  const query = params.toString();
  return `/contact${query ? `?${query}` : ""}`;
}

function getAnswer(question: string, product?: Product): Omit<ChatMessage, "id" | "role"> {
  const value = question.toLowerCase();
  if (/dealer|showroom|location|near me/.test(value)) {
    return {
      text: "I can help you find an HTC dealer. Open the dealer finder to search by city or location.",
      link: { href: "/dealers", label: "Find a dealer" },
    };
  }
  if (/price|cost|quote|availability|stock|in stock/.test(value)) {
    return {
      text: product
        ? `${product.displayName || product.name} is listed at ${product.price == null ? "price on request" : `₹${product.price.toLocaleString("en-IN")}`}. Please contact HTC to confirm current availability and get a quote.`
        : "Prices and stock can change. Contact HTC with the product name for current availability and a quote.",
      link: { href: contactLink(product), label: "Ask HTC for a quote" },
    };
  }
  if (/dimension|size|measure|material|fabric|colour|color|finish|feature|spec|detail/.test(value)) {
    if (!product) {
      return {
        text: "Product pages show the visible finish and features available in the catalogue. Please confirm exact materials and dimensions with the HTC team.",
        link: { href: "/furniture", label: "Browse the catalogue" },
      };
    }
    const details = [];
    if (product.visibleColourOrFinish) details.push(`Visible finish: ${product.visibleColourOrFinish}.`);
    if (product.visibleFeatures) details.push(`Visible features: ${product.visibleFeatures}.`);
    if (product.detailsToConfirm) details.push(`Please confirm: ${product.detailsToConfirm}.`);
    return {
      text: details.length
        ? details.join(" ")
        : `I don't have confirmed measurements or material details for ${product.displayName || product.name}. The HTC team can verify them for you.`,
      link: { href: contactLink(product), label: "Confirm product details" },
    };
  }
  if (/deliver|shipping|warranty|return|care|maintenance/.test(value)) {
    return {
      text: "Delivery, warranty and care options depend on the product and dealer. The HTC team can confirm the current details.",
      link: { href: contactLink(product), label: "Ask the HTC team" },
    };
  }
  if (/talk|human|team|contact|person|specialist|enquir/.test(value)) {
    return {
      text: "Of course. Send an enquiry and the HTC team can help you directly.",
      link: { href: contactLink(product), label: "Contact HTC" },
    };
  }
  return {
    text: "I can help with product details, pricing, availability, delivery information or finding a dealer. Choose a suggestion below or ask in your own words.",
    link: { href: contactLink(product), label: "Talk to HTC" },
  };
}

export function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hi, I’m HTC’s product guide. Ask me about product details, prices, availability or finding a dealer.",
    },
  ]);
  const nextMessageId = useRef(1);
  const messageListRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const product = useMemo(
    () => products.find((item) => pathname === `/product/${item.slug}` || pathname === `/product/${item.id}`),
    [pathname],
  );

  useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const sendMessage = (content: string) => {
    const text = content.trim().slice(0, 320);
    if (!text) return;
    const answer = getAnswer(text, product);
    const messageId = nextMessageId.current;
    nextMessageId.current += 2;
    setMessages((current) => [
      ...current,
      { id: messageId, role: "user", text },
      { id: messageId + 1, role: "assistant", ...answer },
    ]);
    setDraft("");
  };

  return (
    <div className="support-chat">
      {open && (
        <section id="support-chat-panel" className="support-chat-panel" role="dialog" aria-modal="false" aria-labelledby="support-chat-title">
          <header className="support-chat-header">
            <div className="support-chat-avatar"><Sparkles size={17} /></div>
            <div>
              <h2 id="support-chat-title">HTC product guide</h2>
              <p>Quick help with the catalogue</p>
            </div>
            <button ref={closeButtonRef} type="button" className="support-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          {product && <p className="support-chat-context">Viewing: {product.displayName || product.name}</p>}

          <div className="support-chat-messages" ref={messageListRef} role="log" aria-live="polite">
            {messages.map((message) => (
              <div className={`support-chat-message support-chat-message-${message.role}`} key={message.id}>
                <p>{message.text}</p>
                {message.link && <Link href={message.link.href}>{message.link.label}</Link>}
              </div>
            ))}
          </div>

          <div className="support-chat-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((question) => (
              <button type="button" key={question} onClick={() => sendMessage(question)}>{question}</button>
            ))}
          </div>

          <form className="support-chat-form" onSubmit={(event) => { event.preventDefault(); sendMessage(draft); }}>
            <label className="sr-only" htmlFor="support-chat-input">Ask HTC a question</label>
            <input
              id="support-chat-input"
              maxLength={320}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={17} /></button>
          </form>
          <p className="support-chat-disclaimer">Guided help based on catalogue information. Product details should be confirmed with HTC.</p>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        className="support-chat-launcher"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-label={open ? "Close HTC product guide" : "Chat with HTC"}
      >
        {open ? <X size={21} /> : <MessageCircle size={21} />}
        {!open && <span>Need help?</span>}
      </button>
    </div>
  );
}
