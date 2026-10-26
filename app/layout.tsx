import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HTC Furniture | Imported Furniture for Modern Living",
  description: "Explore premium imported furniture, curated collections and authorised HTC Furniture dealers.",
  applicationName: "HTC Furniture"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
