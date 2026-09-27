import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, Search, ShoppingBag, User, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { SideMenu } from "./SideMenu";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { categoriesQuery, settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

function CountBadge({ value, color = "bg-coral" }: { value: number; color?: string }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "animate-pop absolute -right-1.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
        color === "bg-coral" ? "bg-[image:var(--gradient-coral)]" : color
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}

const PRIMARY_NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/shop" },
  { label: "Live Offers 🔥", to: "/offers", isOffer: true },
  { label: "Categories", to: "/categories" },
  { label: "Birthday & Party", to: "/category/birthday-party" },
  { label: "German Silver", to: "/category/german-silver" },
  { label: "Return Gifts", to: "/category/return-gifts" },
  { label: "Bags", to: "/category/bags" },
  { label: "Backdrop & Fabrics", to: "/category/backdrop-fabrics" },
  { label: "Wedding & Marriage", to: "/category/wedding-marriage" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { count: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const announcementText = settings?.seo_description || BRAND.strip;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE8DC] shadow-[0_2px_12px_rgba(17,27,46,0.04)]">
        {/* Top Announcement Bar */}
        <div className="border-b border-[#F4ECD8] bg-[#FFF8ED] py-1.5 text-center text-[11px] sm:text-xs font-semibold tracking-wide text-[#111B2E]">
          <div className="container-page flex items-center justify-center gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
              <span>{announcementText}</span>
              <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            </span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="container-page flex items-center justify-between gap-3 md:gap-6 py-2.5 sm:py-3">
          {/* Left: Mobile menu toggle + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-[#111B2E] border border-border transition hover:bg-muted active:scale-95 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo variant="header" />
          </div>

          {/* Center: Search Bar on Desktop */}
          <div className="hidden lg:block w-full max-w-xl mx-auto">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              to="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-[#111B2E] border border-border transition hover:bg-muted sm:hidden"
            >
              <Search className="h-4.5 w-4.5" />
            </Link>

            <Link
              to={user ? "/account" : "/auth"}
              aria-label="Account"
              className="hidden h-10 items-center gap-2 rounded-xl bg-secondary border border-border px-3.5 text-[#111B2E] transition hover:bg-muted sm:flex"
            >
              <User className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold">{user ? "Account" : "Sign In"}</span>
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary border border-border text-[#111B2E] transition hover:bg-muted"
            >
              <Heart className="h-4.5 w-4.5 text-pink" />
              <CountBadge value={wishlistItems.length} color="bg-coral" />
            </Link>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#F5B82E]/15 border border-gold/30 text-[#111B2E] transition hover:bg-[#F5B82E]/25"
            >
              <ShoppingBag className="h-5 w-5 text-gold" />
              <CountBadge value={cartCount} color="bg-coral" />
            </Link>
          </div>
        </div>

        {/* Secondary Navigation Row on Desktop */}
        <nav aria-label="Categories Navigation" className="hidden border-t border-[#F2ECE0] bg-[#FFFDF8] lg:block">
          <div className="container-page flex items-center justify-between gap-1 overflow-x-auto py-1.5 text-[13px] font-medium text-[#111B2E]">
            <div className="flex items-center gap-0.5 xl:gap-1.5">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to as never}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-2.5 py-1.5 transition-colors duration-150",
                      item.isOffer
                        ? "font-bold text-coral hover:bg-pink-soft"
                        : isActive
                          ? "bg-secondary font-bold text-gold border border-gold/30 shadow-xs"
                          : "text-[#23314D] hover:bg-secondary hover:text-gold"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-gold)] px-3 py-1 text-xs font-bold text-[#111B2E] shadow-sm transition hover:brightness-105"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
