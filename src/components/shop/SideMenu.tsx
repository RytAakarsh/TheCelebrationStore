import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, X, Instagram, Facebook, Youtube } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

const primary = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Offers", to: "/offers" },
];

const account = [
  { label: "My Account", to: "/account" },
  { label: "My Orders", to: "/account/orders" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Cart", to: "/cart" },
];

export function SideMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto border-r-gold/30 p-0 surface-ink">
        <div className="relative border-b border-gold/25 p-4">
          <Logo size={40} />
          <button
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="p-4 text-sm" aria-label="Main">
          <ul className="space-y-1">
            {primary.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to as never}
                  onClick={close}
                  className="block rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Shop by category</p>
          <ul className="mt-1 space-y-1">
            {(categories ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={close}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-white/10"
                >
                  <span aria-hidden>{c.icon}</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Your account</p>
          <ul className="mt-1 space-y-1">
            {account.map((l) => (
              <li key={l.to}>
                <Link to={l.to as never} onClick={close} className="block rounded-lg px-3 py-2.5 hover:bg-white/10">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <Link to="/contact" onClick={close} className="block rounded-lg px-3 py-2.5 hover:bg-white/10">
              Contact Us
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp Us
            </a>
            <a href={`tel:+91${BRAND.phone}`} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-white/10">
              <Phone className="h-4 w-4 text-gold" /> Call {BRAND.phoneDisplay}
            </a>
          </div>

          {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
            <div className="mt-5 flex gap-3 border-t border-white/10 px-3 pt-4">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram className="h-5 w-5 text-gold" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook className="h-5 w-5 text-gold" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer" aria-label="YouTube">
                  <Youtube className="h-5 w-5 text-gold" />
                </a>
              )}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
