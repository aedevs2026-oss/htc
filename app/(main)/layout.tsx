import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { DealerLocationPrompt } from "@/components/dealer-location-prompt";
import { SupportChat } from "@/components/support-chat";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
      <MobileTabBar />
      <SupportChat />
      <DealerLocationPrompt />
    </>
  );
}
