import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="lg:pl-64 pb-16 lg:pb-0">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
