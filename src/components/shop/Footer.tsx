import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Instagram, Facebook, Youtube, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function Footer() {
  const { data: categories } = useQuery(categoriesQuery());
  const { data: settings } = useQuery(settingsQuery());

  return (
    <footer className="mt-16 surface-ink pb-24 lg:pb-0">
      <div className="gold-rule h-1" />

      {/* Trust & Features banner */}
      <div className="border-b border-white/10 bg-black/20 py-6">
        <div className="container-page grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 text-cream/90">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Premium Quality</p>
              <p className="text-xs text-cream/70">Celebration essentials &amp; gifts curated with care</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-cream/90">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Fast Delivery Across India</p>
              <p className="text-xs text-cream/70">Flat ₹79 shipping • Free on orders over ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-cream/90">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Trusted Store</p>
              <p className="text-xs text-cream/70">Poorna Market, Visakhapatnam • WhatsApp assistance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-4">
          <Logo variant="footer" height={52} />
          <p className="text-sm font-semibold text-gold">{BRAND.tagline}</p>
          <p className="text-xs leading-relaxed text-cream/75">
            Your one-stop destination for balloons, party decorations, German silver return gifts, wedding essentials and celebration supplies.
          </p>
          <div className="pt-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600/30 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-600/40"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              Chat on WhatsApp: {BRAND.phone}
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Shop Categories</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-cream/80">
            <li><Link to="/shop" className="transition hover:text-gold">Shop All Products</Link></li>
            <li><Link to="/offers" className="font-semibold text-pink transition hover:text-pink-soft">Live Celebration Deals</Link></li>
            {(categories ?? []).slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="transition hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Customer Support</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-cream/80">
            <li><Link to="/about" className="transition hover:text-gold">About Our Brand</Link></li>
            <li><Link to="/contact" className="transition hover:text-gold">Contact &amp; Store Location</Link></li>
            <li><Link to="/faq" className="transition hover:text-gold">Frequently Asked Questions</Link></li>
            <li><Link to="/shipping-policy" className="transition hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/cancellation-refund-policy" className="transition hover:text-gold">Cancellation &amp; Refund Policy</Link></li>
            <li><Link to="/terms" className="transition hover:text-gold">Terms of Service</Link></li>
            <li><Link to="/privacy-policy" className="transition hover:text-gold">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Store Address</h3>
          <address className="mt-4 space-y-3 text-xs not-italic text-cream/80">
            <div className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div className="leading-relaxed">
                <span className="font-bold text-cream">Party World</span>
                <span className="block">Poorna Market</span>
                <span className="block">Visakhapatnam - 530001</span>
                <span className="block">Andhra Pradesh, India</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:+91${BRAND.phone}`} className="transition hover:text-gold">{BRAND.phoneDisplay}</a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${BRAND.email}`} className="break-all transition hover:text-gold">{BRAND.email}</a>
            </div>
          </address>

          {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
            <div className="mt-6 flex gap-3 pt-2">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-cream/60">
        <div className="container-page flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="text-gold/80">{BRAND.tagline} • Visakhapatnam, Andhra Pradesh</p>
        </div>
      </div>
    </footer>
  );
}
