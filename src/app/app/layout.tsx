import { Logo } from "@/components/brand/logo";
import { AccountPanel, MobileAccountMenu } from "@/components/app/account-menu";
import { DemoBanner } from "@/components/app/demo-banner";
import { AddShortcut, MobileAddButton, MobileNav, SidebarNav } from "@/components/app/nav";
import { ProductSheetProvider } from "@/components/app/product-sheet";
import { TimezoneSync } from "@/components/app/timezone-sync";
import { ToastProvider } from "@/components/ui/toast";
import { getNavCounts, hasDemoData } from "@/lib/data/queries";
import { requireViewer, TIMEZONE_COOKIE } from "@/lib/data/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const [counts, demo] = await Promise.all([getNavCounts(viewer), hasDemoData(viewer)]);

  return (
    <ToastProvider>
      <ProductSheetProvider today={viewer.today}>
        <TimezoneSync current={viewer.timeZone} cookieName={TIMEZONE_COOKIE} />
        <AddShortcut />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-paper px-5 pb-5 pt-7 lg:flex">
            <div className="px-2">
              <Logo href="/app" />
            </div>
            <div className="mt-9 flex-1 overflow-y-auto">
              <SidebarNav counts={counts} />
            </div>
            <AccountPanel viewer={viewer} />
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
              <Logo href="/app" />
              <div className="flex items-center gap-2">
                <MobileAddButton />
                <MobileAccountMenu viewer={viewer} />
              </div>
            </header>
            {(demo || viewer.isAnonymous) && <DemoBanner isAnonymous={viewer.isAnonymous} />}
            <main id="main" className="mx-auto max-w-[1180px] px-4 pb-32 pt-8 sm:px-6 lg:px-10 lg:pb-16 lg:pt-12">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
      </ProductSheetProvider>
    </ToastProvider>
  );
}
