import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, X, ChevronDown, ChevronRight, Heart, ShoppingBag, User, Package, Sparkles, Instagram, Facebook, Youtube, MapPin, Mail } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";
import { categoriesQuery, settingsQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto border-r border-gold/30 p-0 surface-ink no-scrollbar">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/30 p-4">
          <Logo variant="header" height={40} />
          <button
            onClick={close}
            aria-label="Close menu"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User quick badge */}
        <div className="border-b border-white/10 bg-white/5 p-3.5 px-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream/70">Welcome back,</p>
                <p className="text-sm font-bold text-gold">{user.email?.split("@")[0]}</p>
              </div>
              <Link
                to="/account"
                onClick={close}
                className="rounded-lg bg-gold/20 px-3 py-1 text-xs font-semibold text-gold hover:bg-gold/30"
              >
                Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-cream/80">Welcome to {BRAND.name}</span>
              <Link
                to="/auth"
                onClick={close}
                className="rounded-lg bg-pink px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-pink/90"
              >
                Sign In / Join
              </Link>
            </div>
          )}
        </div>

        <nav className="p-4 text-sm" aria-label="Mobile Navigation">
          {/* Main Links */}
          <div className="space-y-1">
            <Link
              to="/"
              onClick={close}
              className="flex items-center justify-between rounded-lg px-3 py-2 font-semibold text-cream hover:bg-white/10"
            >
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              onClick={close}
              className="flex items-center justify-between rounded-lg px-3 py-2 font-semibold text-cream hover:bg-white/10"
            >
              <span>Shop All Products</span>
              <Sparkles className="h-4 w-4 text-gold" />
            </Link>
            <Link
              to="/offers"
              onClick={close}
              className="flex items-center justify-between rounded-lg px-3 py-2 font-bold text-pink hover:bg-white/10"
            >
              <span>Live Celebration Deals 🔥</span>
            </Link>
            <Link
              to="/categories"
              onClick={close}
              className="flex items-center justify-between rounded-lg px-3 py-2 font-semibold text-cream hover:bg-white/10"
            >
              <span>All Categories</span>
            </Link>
          </div>

          {/* Categories Accordion */}
          <div className="mt-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Shop By Department</p>
            <div className="mt-2 space-y-1">
              {(categories ?? []).map((c) => {
                const isExpanded = expandedCat === c.id;
                const subs = c.subcategories ?? [];
                return (
                  <div key={c.id} className="rounded-lg bg-white/[0.03] overflow-hidden">
                    <div className="flex items-center justify-between">
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={close}
                        className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-cream/90 hover:text-gold"
                      >
                        <span className="text-base">{c.icon || "✨"}</span>
                        <span>{c.name}</span>
                      </Link>
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleCat(c.id)}
                          aria-label={`Expand ${c.name}`}
                          className="px-3 py-2.5 text-cream/60 hover:text-gold"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </div>

                    {isExpanded && subs.length > 0 && (
                      <div className="border-t border-white/5 bg-black/20 px-4 py-2 space-y-1">
                        {subs.map((s) => (
                          <Link
                            key={s.id}
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            search={{ sub: s.slug }}
                            onClick={close}
                            className="block rounded px-2.5 py-1.5 text-xs text-cream/70 hover:bg-white/5 hover:text-gold"
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

          {/* Account shortcuts */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Quick Access</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  to="/cart"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-cream/90 hover:bg-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4 text-gold" /> My Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-pink px-2 py-0.5 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-cream/90 hover:bg-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="h-4 w-4 text-gold" /> Saved Wishlist
                  </span>
                  {wishlistItems.length > 0 && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/account/orders"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-cream/90 hover:bg-white/10"
                >
                  <Package className="h-4 w-4 text-gold" /> Order Tracking &amp; History
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-cream/90 hover:bg-white/10"
                >
                  <User className="h-4 w-4 text-gold" /> Profile &amp; Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp & Contact Actions */}
          <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl bg-emerald-600/30 px-3.5 py-2.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-600/40"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp Store Support</span>
            </a>
            <a
              href={`tel:+91${BRAND.phone}`}
              className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-cream hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-gold" />
              <span>Call: {BRAND.phoneDisplay}</span>
            </a>
            <Link
              to="/contact"
              onClick={close}
              className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-cream hover:bg-white/10"
            >
              <Mail className="h-4 w-4 text-gold" />
              <span>Contact &amp; Store Location</span>
            </Link>
          </div>

          {/* Footer details */}
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-cream/60 space-y-2">
            <p className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold mt-0.5" />
              <span>Party World, Poorna Market, Visakhapatnam - 530001</span>
            </p>
            <p className="text-[11px] text-gold/80 font-medium">{BRAND.tagline}</p>

            {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
              <div className="flex gap-3 pt-2">
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-gold hover:text-gold/80">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-gold hover:text-gold/80">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {settings?.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noreferrer" aria-label="YouTube" className="text-gold hover:text-gold/80">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
