import { Suspense, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUi } from "@/stores/ui-store";
import { DesktopSidebar, SidebarContent } from "./sidebar";
import { LogoMark } from "./logo";
import { PageLoader } from "@/components/common/page-loader";

function ThemeToggle() {
  const theme = useUi((s) => s.theme);
  const set = useUi((s) => s.set);
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={`Giao diện: ${theme === "system" ? "theo hệ thống" : theme === "dark" ? "tối" : "sáng"}`}
      onClick={() => set({ theme: isDark ? "light" : "dark" })}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

export function AppShell() {
  const open = useUi((s) => s.mobileNavOpen);
  const setOpen = useUi((s) => s.setMobileNavOpen);
  useUi((s) => s.theme); // re-render khi đổi giao diện
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    // Không cuộn lên đầu nếu chỉ đổi query (ví dụ chuyển trang PDF)
  }, [location.pathname, setOpen]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Bỏ qua điều hướng
      </a>
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Mở menu" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <LogoMark className="size-7" />
            <span className="text-sm font-bold">Chemistry Hub</span>
          </Link>
          <div id="topbar-slot" className="hidden min-w-0 flex-1 items-center lg:flex" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="min-w-0 flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" title="Chemistry Learning Hub">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
