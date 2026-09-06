import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Instagram, Facebook, Youtube } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function Footer() {
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());

  return (
    <footer className="mt-10 surface-ink pb-24 lg:pb-0">
      <div className="gold-rule h-1" />
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-lg font-bold">Vizag Party World</h2>
          <p className="mt-1 text-sm text-gold">{BRAND.tagline}</p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Your one-stop destination for balloons, party decorations, German silver return gifts and celebration
            essentials in Visakhapatnam.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-gold">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Shop</Link></li>
            <li><Link to="/categories" className="hover:text-gold">Categories</Link></li>
            <li><Link to="/offers" className="hover:text-gold">Offers</Link></li>
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-gold">Customer Care</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/cancellation-refund-policy" className="hover:text-gold">Cancellation &amp; Refunds</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
          </ul>
          <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-gold">Categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {(categories ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-gold">Visit / Contact</h3>
          <address className="mt-3 space-y-3 text-sm not-italic text-cream/80">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {BRAND.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:+91${BRAND.phone}`} className="hover:text-gold">{BRAND.phoneDisplay}</a>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-gold">
                WhatsApp {BRAND.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${BRAND.email}`} className="break-all hover:text-gold">{BRAND.email}</a>
            </p>
          </address>
          {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
            <div className="mt-4 flex gap-3">
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
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} Vizag Party World · Poorna Market, Visakhapatnam
      </div>
    </footer>
  );
}
