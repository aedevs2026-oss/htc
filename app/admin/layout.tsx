import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "HTC Admin | Catalogue",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
