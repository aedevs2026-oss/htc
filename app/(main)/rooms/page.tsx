import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const rooms = [
  { title: "Living room", desc: "A welcoming space for everyday moments.", image: "living-room-hero", count: "Sofas, tables, accent chairs" },
  { title: "Bedroom", desc: "Restful pieces to make the everyday feel special.", image: "bedroom", count: "Beds, side tables, storage" },
  { title: "Dining room", desc: "Designed for long conversations and shared meals.", image: "dining-room", count: "Dining tables, chairs, cabinets" },
  { title: "Home office", desc: "A considered workspace that inspires focus.", image: "home-office", count: "Desks, task chairs, storage" },
  { title: "Outdoor living", desc: "Make room for fresh air and slower moments.", image: "outdoor-living", count: "Outdoor sofas, loungers" },
  { title: "Reading corner", desc: "A quiet corner, made entirely your own.", image: "accent-chair", count: "Lounge chairs, side tables" }
];
export default function RoomsPage() {
  return <>
    <section className="page-hero rooms-hero"><Image src="/images/living-room-hero.webp" alt="Premium contemporary living room with sculptural furniture and warm natural light" fill priority sizes="100vw" /><div className="page-hero-overlay" /><div className="site-container page-hero-content"><p className="eyebrow">Spaces with intention</p><h1>Every room has<br /><em>a story.</em></h1><p>Find inspiration and furniture that brings each corner of your home to life.</p><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span> Rooms</div></div></section>
    <section className="section site-container"><SectionHeading eyebrow="Explore your space" title="Shop by room" description="Start with the way you want to live. We’ll help you discover the pieces that make it yours." />
      <div className="room-page-grid">{rooms.map((room) => <Link href="/furniture" className="room-large-card" key={room.title}><div className="room-large-image"><Image src={`/images/${room.image}.webp`} alt={room.title} fill sizes="(max-width: 640px) 50vw, 33vw" /></div><div className="room-large-copy"><p>{room.count}</p><h3>{room.title}</h3><span>{room.desc}</span><b>Explore room <ArrowRight size={15} /></b></div></Link>)}</div>
    </section>
  </>;
}
