import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Home,
  Images,
  Tag,
  Ticket,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shop/Logo";

const NAV: { to: string; label: string; icon: typeof Package }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/offers", label: "Live Offers", icon: Tag },
  { to: "/admin/banners", label: "Hero Banners", icon: Images },
  { to: "/admin/homepage", label: "Homepage Sections", icon: Home },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Store Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to as never}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
              active
                ? "bg-gold text-ink font-bold shadow-sm"
                : "text-cream/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#101827] text-white lg:flex">
        {/* Brand Header */}
        <div className="border-b border-white/10 px-5 py-4 space-y-2">
          <Logo variant="admin" height={36} />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Admin Console
            </span>
            <Link to="/" target="_blank" className="text-[10px] text-cream/60 hover:text-gold flex items-center gap-1">
              <span>View Store</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          <NavList />
        </div>

        {/* Admin User Footer */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <div className="text-xs text-cream/70 truncate">
            <p className="font-bold text-white truncate">{user?.email}</p>
            <p className="text-[11px] text-gold">Administrator</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open admin menu" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-white/10 bg-[#101827] p-0 text-white flex flex-col">
                <div className="border-b border-white/10 px-5 py-4 space-y-2">
                  <Logo variant="admin" height={36} />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin Console
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                  <NavList onNavigate={() => setOpen(false)} />
                </div>
                <div className="border-t border-white/10 p-4">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-rose-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-display text-sm font-bold text-ink">{BRAND.name}</span>
          </div>

          <Link to="/" target="_blank" className="text-xs text-muted-foreground hover:text-pink flex items-center gap-1">
            <span>Store</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </header>

        <main className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">{title}</h1>
          {description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="text-xs font-medium">Loading store administration data...</span>
      </div>
    </div>
  );
}
