"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tags, LogOut, ExternalLink, Home, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/catalog", label: "Catalog sync", icon: Database },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>HTC</span>
          <small>Catalogue admin</small>
        </div>
        <nav className="admin-nav">
          {links.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={active ? "admin-nav-link active" : "admin-nav-link"}>
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          {email && <p className="admin-user">{email}</p>}
          <Link href="/furniture" className="admin-nav-link subtle">
            <ExternalLink size={16} />
            View storefront
          </Link>
          <button type="button" className="admin-nav-link subtle" onClick={signOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <p>Manage HTC product catalogue, prices and category images.</p>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
