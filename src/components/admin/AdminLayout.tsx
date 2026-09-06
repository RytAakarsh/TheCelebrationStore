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
  Settings,
  LogOut,
  Menu,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof Package }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/banners", label: "Hero Banners", icon: Images },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/settings", label: "Settings", icon: Settings },
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-gold/15 text-gold" : "text-cream/70 hover:bg-cream/5 hover:text-cream",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-cream/10 bg-ink lg:flex">
        <div className="border-b border-cream/10 px-4 py-4">
          <p className="font-display text-base font-bold text-cream">Vizag Party World</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Admin Console</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 border-t border-cream/10 px-6 py-4 text-sm font-medium text-cream/70 hover:text-cream"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open admin menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-cream/10 bg-ink p-0">
              <div className="border-b border-cream/10 px-4 py-4">
                <p className="font-display text-base font-bold text-cream">Vizag Party World</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Admin Console</p>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 border-t border-cream/10 px-6 py-4 text-sm font-medium text-cream/70"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </SheetContent>
          </Sheet>
          <span className="font-display text-sm font-bold">Admin Console</span>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
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
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="grid place-items-center py-24 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
