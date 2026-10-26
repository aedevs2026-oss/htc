"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Armchair, PanelsTopLeft, MapPin, Menu } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Furniture", href: "/furniture", icon: Armchair },
  { label: "Collections", href: "/collections", icon: PanelsTopLeft },
  { label: "Dealers", href: "/dealers", icon: MapPin },
  { label: "More", href: "/contact", icon: Menu }
];

export function MobileTabBar() {
  const pathname = usePathname();
  return <nav className="mobile-tab-bar" aria-label="Mobile navigation">
    {tabs.map(({ label, href, icon: Icon }) => <Link href={href} key={label} className={pathname === href ? "mobile-tab active" : "mobile-tab"}>
      <Icon size={20} strokeWidth={1.7} /><span>{label}</span>
    </Link>)}
  </nav>;
}
