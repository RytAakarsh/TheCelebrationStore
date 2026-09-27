import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, X, ChevronDown, ChevronRight, Heart, ShoppingBag, User, Package, Sparkles, MapPin, Mail, Flame, Store } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";
import { categoriesQuery, settingsQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

const DEPARTMENT_FALLBACKS = [
  { slug: "birthday-party", name: "Birthday & Party", icon: "🎈" },
  { slug: "german-silver", name: "German Silver", icon: "💍" },
  { slug: "return-gifts", name: "Return Gifts", icon: "🎁" },
  { slug: "bags", name: "Bags & Pouches", icon: "👜" },
  { slug: "backdrop-fabrics", name: "Backdrop & Fabrics", icon: "✨" },
  { slug: "wedding-marriage", name: "Wedding & Marriage", icon: "💐" },
];

export function SideMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const close = () => onOpenChange(false);

  const toggleCat = (id: string) => {
    setExpandedCat((prev) => (prev === id ? null : id));
  };

  const displayCategories =
    categories && categories.length > 0
      ? categories
      : DEPARTMENT_FALLBACKS.map((d, i) => ({
          id: `fallback-${i}`,
          slug: d.slug,
          name: d.name,
          icon: d.icon,
          subcategories: [],
        }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-sm overflow-y-auto border-r border-gold/30 p-0 surface-navy text-white no-scrollbar"
      >
        {/* Header with White Logo Container */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/40 p-4">
          <div className="rounded-xl bg-white/95 px-3 py-1.5 shadow-sm border border-gold/20">
            <Logo variant="mobile" height={44} />
          </div>
          <button
            onClick={close}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* User Account / Welcome banner */}
        <div className="border-b border-gold/20 bg-gradient-to-r from-gold/15 to-transparent p-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-cream/70">Welcome back,</p>
                <p className="text-sm font-bold text-gold">{user.email?.split("@")[0]}</p>
              </div>
              <Link
                to="/account"
                onClick={close}
                className="rounded-lg bg-[image:var(--gradient-gold)] px-3 py-1.5 text-xs font-bold text-[#111B2E] shadow-sm hover:brightness-105"
              >
                My Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Make Every Moment Special</p>
                <p className="text-[11px] text-cream/70">Sign in for saved orders & wishlist</p>
              </div>
              <Link
                to="/auth"
                onClick={close}
                className="rounded-lg bg-[image:var(--gradient-coral)] px-3.5 py-1.5 text-xs font-bold text-white shadow-coral hover:brightness-105"
              >
                Sign In / Join
              </Link>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-6 text-sm" aria-label="Mobile Navigation">
          {/* Main Quick Links */}
          <div className="space-y-1.5">
            <Link
              to="/"
              onClick={close}
              className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 font-medium text-white transition hover:bg-white/[0.08] hover:text-gold"
            >
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              onClick={close}
              className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 font-medium text-white transition hover:bg-white/[0.08] hover:text-gold"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>Shop All Products</span>
              </span>
            </Link>
            <Link
              to="/offers"
              onClick={close}
              className="flex items-center justify-between rounded-xl bg-coral/15 border border-coral/30 px-3.5 py-2.5 font-bold text-coral transition hover:bg-coral/25"
            >
              <span className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-coral" />
                <span>Live Celebration Deals 🔥</span>
              </span>
            </Link>
            <Link
              to="/categories"
              onClick={close}
              className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 font-medium text-white transition hover:bg-white/[0.08] hover:text-gold"
            >
              <span>All Categories</span>
            </Link>
          </div>

          {/* Department Cards */}
          <div>
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Shop By Department</p>
            <div className="mt-2.5 space-y-2">
              {displayCategories.map((c) => {
                const isExpanded = expandedCat === c.id;
                const subs = (c as { subcategories?: { id: string; name: string; slug: string }[] }).subcategories ?? [];
                return (
                  <div
                    key={c.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-gold/30"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={close}
                        className="flex flex-1 items-center gap-3 px-3.5 py-3 text-xs font-semibold text-white/95 hover:text-gold"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-base">
                          {c.icon || "✨"}
                        </span>
                        <span>{c.name}</span>
                      </Link>
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleCat(c.id)}
                          aria-label={`Expand ${c.name}`}
                          className="px-3 py-3 text-white/60 hover:text-gold"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </div>

                    {isExpanded && subs.length > 0 && (
                      <div className="border-t border-white/5 bg-black/30 px-4 py-2 space-y-1">
                        {subs.map((s) => (
                          <Link
                            key={s.id}
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            search={{ sub: s.slug }}
                            onClick={close}
                            className="block rounded-lg px-2.5 py-1.5 text-xs text-cream/70 hover:bg-white/5 hover:text-gold"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access */}
          <div className="border-t border-white/10 pt-5">
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Quick Access</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Link
                to="/cart"
                onClick={close}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08]"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gold" />
                  <span>My Cart</span>
                </span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-[image:var(--gradient-coral)] px-2 py-0.5 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/wishlist"
                onClick={close}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08]"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink" />
                  <span>Wishlist</span>
                </span>
                {wishlistItems.length > 0 && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link
                to="/account/orders"
                onClick={close}
                className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08]"
              >
                <Package className="h-4 w-4 text-gold" />
                <span>Orders</span>
              </Link>
              <Link
                to="/account"
                onClick={close}
                className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08]"
              >
                <User className="h-4 w-4 text-gold" />
                <span>Profile</span>
              </Link>
            </div>
          </div>

          {/* Need Help & Contact */}
          <div className="space-y-2 border-t border-white/10 pt-5">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/30 border border-emerald-500/30 px-4 py-3 text-xs font-bold text-emerald-300 transition hover:bg-emerald-600/40"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>Chat on WhatsApp: {BRAND.phone}</span>
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:+91${BRAND.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-cream hover:bg-white/10"
              >
                <Phone className="h-3.5 w-3.5 text-gold" />
                <span>Call Store</span>
              </a>
              <Link
                to="/contact"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-cream hover:bg-white/10"
              >
                <Store className="h-3.5 w-3.5 text-gold" />
                <span>Store Location</span>
              </Link>
            </div>
          </div>

          {/* Store Address Footer */}
          <div className="border-t border-white/10 pt-4 text-xs text-cream/70 space-y-1.5">
            <p className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold mt-0.5" />
              <span>Party World, Poorna Market, Visakhapatnam - 530001</span>
            </p>
            <p className="text-[11px] text-gold font-medium pt-1">Make Every Moment Special</p>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
