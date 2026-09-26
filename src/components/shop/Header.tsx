import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, Search, ShoppingBag, User, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { SideMenu } from "./SideMenu";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

function CountBadge({ value, color = "bg-pink" }: { value: number; color?: string }) {
  if (!value) return null;
  return (
    <span className={`animate-pop absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full ${color} px-1 text-[10px] font-bold text-white shadow-sm`}>
      {value > 99 ? "99+" : value}
    </span>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());

  const announcementText = settings?.seo_description || BRAND.strip;

  return (
    <>
      <header className="sticky top-0 z-40 surface-ink shadow-md">
        {/* Top Announcement Bar */}
        <div className="border-b border-white/10 bg-black/25 py-1.5 text-center text-[11px] sm:text-xs font-semibold tracking-wide text-gold">
          <div className="container-page flex items-center justify-center gap-2">
            <span>✨ {announcementText} 🎉</span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6 py-2.5 sm:py-3.5">
          {/* Left: Mobile menu toggle + Brand Logo */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-cream transition hover:bg-white/15 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo variant="header" />
          </div>

          {/* Center: Search Bar on Desktop */}
          <div className="hidden lg:block w-full max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-cream transition hover:bg-white/15 lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              to={user ? "/account" : "/auth"}
              aria-label="Account"
              className="hidden h-10 items-center gap-2 rounded-xl bg-white/5 px-3.5 text-cream transition hover:bg-white/15 sm:flex"
            >
              <User className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold">{user ? "Account" : "Sign In"}</span>
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-xl bg-white/5 text-cream transition hover:bg-white/15 sm:grid"
            >
              <Heart className="h-4 w-4 text-pink" />
              <CountBadge value={wishlistItems.length} color="bg-pink" />
            </Link>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-gold transition hover:bg-gold/30"
            >
              <ShoppingBag className="h-5 w-5 text-gold" />
              <CountBadge value={count} color="bg-pink" />
            </Link>
          </div>
        </div>

        {/* Secondary Navigation */}
        <nav aria-label="Categories Navigation" className="hidden border-t border-white/10 bg-black/15 lg:block">
          <div className="container-page flex items-center justify-between gap-1 overflow-x-auto py-2 text-xs font-semibold text-cream/90">
            <div className="flex items-center gap-1">
              <Link to="/" className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold">
                Home
              </Link>
              <Link to="/shop" className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold">
                Shop All
              </Link>
              <Link to="/offers" className="rounded-lg px-3 py-1.5 font-bold text-pink transition hover:bg-white/10 hover:text-pink-soft">
                Live Offers 🔥
              </Link>
              <Link to="/categories" className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold">
                Categories
              </Link>

              {(categories ?? []).slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="whitespace-nowrap rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold"
                >
                  {c.name}
                </Link>
              ))}

              <Link to="/about" className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold">
                About
              </Link>
              <Link to="/contact" className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-gold">
                Contact
              </Link>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:bg-gold-premium"
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
