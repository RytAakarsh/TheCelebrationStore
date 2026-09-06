import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { SideMenu } from "./SideMenu";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { categoriesQuery } from "@/lib/queries";

function CountBadge({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="animate-pop absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-pink px-1 text-[10px] font-bold text-primary-foreground">
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

  return (
    <>
      <header className="sticky top-0 z-40 surface-ink">
        <div className="border-b border-white/10 bg-black/20 py-1.5 text-center text-[11px] font-medium tracking-wide text-gold">
          {BRAND.strip}
        </div>

        <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          <div className="hidden lg:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/10 lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              to={user ? "/account" : "/auth"}
              aria-label="Account"
              className="hidden h-10 items-center gap-2 rounded-lg px-3 hover:bg-white/10 sm:flex"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-semibold">{user ? "Account" : "Sign in"}</span>
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-lg hover:bg-white/10 sm:grid"
            >
              <Heart className="h-5 w-5" />
              <CountBadge value={wishlistItems.length} />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-white/10">
              <ShoppingBag className="h-5 w-5" />
              <CountBadge value={count} />
            </Link>
          </div>
        </div>

        <nav aria-label="Categories" className="hidden border-t border-white/10 lg:block">
          <div className="container-page flex items-center gap-1 overflow-x-auto py-2 text-sm">
            <Link to="/" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-white/10">
              Home
            </Link>
            <Link to="/shop" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-white/10">
              Shop
            </Link>
            <Link to="/categories" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-white/10">
              Categories
            </Link>
            <Link to="/offers" className="rounded-lg px-3 py-1.5 font-semibold text-gold hover:bg-white/10">
              Offers
            </Link>
            {(categories ?? []).slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 hover:bg-white/10"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/contact" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
              Contact
            </Link>
            {isAdmin && (
              <Link to="/admin" className="ml-auto rounded-lg bg-gold px-3 py-1.5 font-bold text-gold-foreground">
                Admin
              </Link>
            )}
          </div>
        </nav>
      </header>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
