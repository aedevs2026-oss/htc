import Image from "next/image";
import Link from "next/link";
import { Search, Heart, UserRound, MapPin } from "lucide-react";

const links = [
  ["Home", "/"], ["Furniture", "/furniture"], ["Rooms", "/rooms"], ["Collections", "/collections"],
  ["For Dealers", "/dealers"], ["About", "/about"], ["Contact", "/contact"]
];

export function SiteHeader() {
  return (
    <>
      <div className="announcement-bar">Imported furniture for modern living <span>·</span> Discover a world of design</div>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/" className="brand-logo" aria-label="HTC Furniture home"><Image src="/brand/htc-logo.svg" alt="HTC Furniture" width={112} height={58} priority /></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <Link href="/furniture" aria-label="Search furniture"><Search /></Link>
            <Link href="/furniture#featured" aria-label="Saved furniture"><Heart /></Link>
            <Link href="/contact" aria-label="Your account"><UserRound /></Link>
            <Link href="/dealers" className="header-dealer"><MapPin size={15} /> Find a dealer <span>↗</span></Link>
          </div>
        </div>
      </header>
    </>
  );
}
