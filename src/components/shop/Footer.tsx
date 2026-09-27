import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Instagram, Facebook, Youtube, ChevronDown, ChevronUp, Sparkles, Heart } from "lucide-react";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/brand";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const SHOP_LINKS = [
  { label: "Shop All Products", to: "/shop" },
  { label: "Live Celebration Deals 🔥", to: "/offers", isOffer: true },
  { label: "Birthday & Party", to: "/category/birthday-party" },
  { label: "German Silver", to: "/category/german-silver" },
  { label: "Return Gifts", to: "/category/return-gifts" },
  { label: "Bags & Pouches", to: "/category/bags" },
  { label: "Backdrop & Fabrics", to: "/category/backdrop-fabrics" },
  { label: "Wedding & Marriage", to: "/category/wedding-marriage" },
];

const SUPPORT_LINKS = [
  { label: "About Our Brand", to: "/about" },
  { label: "Contact & Store Location", to: "/contact" },
  { label: "Frequently Asked Questions", to: "/faq" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Cancellation & Refund Policy", to: "/cancellation-refund-policy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

export function Footer() {
  const { data: settings } = useQuery(settingsQuery());
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    support: false,
    store: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <footer className="mt-14 sm:mt-20 surface-navy text-white pb-24 lg:pb-0 relative overflow-hidden border-t-2 border-gold/40">
      {/* Decorative Gold Top Rule */}
      <div className="h-1 bg-[image:var(--gradient-gold)]" />

      {/* Main Footer Container */}
      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Identity & WhatsApp Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-block">
              <Logo variant="footer" height={48} />
            </div>
            <p className="text-sm font-bold text-gold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>{BRAND.tagline}</span>
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-cream/80 max-w-sm">
              Your premier boutique for balloons, party decorations, German silver return gifts, wedding essentials and celebration supplies based in Visakhapatnam, Andhra Pradesh.
            </p>

            <div className="pt-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600/30 border border-emerald-500/40 px-4 py-2.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-600/50 hover:scale-[1.02] shadow-sm"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Chat on WhatsApp: {BRAND.phone}</span>
              </a>
            </div>
          </div>

          {/* Column 1: Shop Categories */}
          <div className="lg:col-span-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection("shop")}
              className="flex w-full items-center justify-between py-2 md:hidden border-b border-white/10"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Shop Categories</span>
              {openSections.shop ? <ChevronUp className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-gold" />}
            </button>

            {/* Desktop Title */}
            <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Shop Categories
            </h3>

            {/* Links */}
            <ul className={cn("space-y-2 text-xs sm:text-sm text-cream/80 mt-3 md:block", openSections.shop ? "block" : "hidden")}>
              {SHOP_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to as never}
                    className={cn(
                      "transition-colors duration-150 inline-block py-0.5",
                      item.isOffer ? "text-coral font-bold hover:text-pink-soft" : "hover:text-gold"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Support */}
          <div className="lg:col-span-2">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection("support")}
              className="flex w-full items-center justify-between py-2 md:hidden border-b border-white/10"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Customer Support</span>
              {openSections.support ? <ChevronUp className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-gold" />}
            </button>

            {/* Desktop Title */}
            <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Customer Support
            </h3>

            {/* Links */}
            <ul className={cn("space-y-2 text-xs sm:text-sm text-cream/80 mt-3 md:block", openSections.support ? "block" : "hidden")}>
              {SUPPORT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to as never} className="transition-colors hover:text-gold inline-block py-0.5">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Store Address & Details */}
          <div className="lg:col-span-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection("store")}
              className="flex w-full items-center justify-between py-2 md:hidden border-b border-white/10"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Store Information</span>
              {openSections.store ? <ChevronUp className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-gold" />}
            </button>

            {/* Desktop Title */}
            <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Store Information
            </h3>

            <address className={cn("not-italic text-xs sm:text-sm space-y-3 mt-3 text-cream/85 md:block", openSections.store ? "block" : "hidden")}>
              <div className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white block">Party World</span>
                  <span>Poorna Market</span>
                  <span className="block">Visakhapatnam - 530001</span>
                  <span className="block text-cream/70">Andhra Pradesh, India</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:+91${BRAND.phone}`} className="transition hover:text-gold">
                  {BRAND.phoneDisplay}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${BRAND.email}`} className="break-all transition hover:text-gold">
                  {BRAND.email}
                </a>
              </div>
            </address>

            {/* Social Links */}
            {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
              <div className="mt-5 flex gap-2.5 pt-2">
                {settings?.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20 hover:text-white transition"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings?.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20 hover:text-white transition"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {settings?.youtube_url && (
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="rounded-full bg-white/10 p-2 text-gold hover:bg-white/20 hover:text-white transition"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar with Managed by MightBeMedia */}
      <div className="border-t border-white/10 bg-black/30 py-5 text-xs text-cream/70">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>

          <div className="flex items-center gap-1.5 text-xs text-cream/80">
            <span>Managed By</span>
            <a
              href="https://mightbemedia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold hover:text-gold-bright transition-colors duration-150 underline-offset-2 hover:underline"
            >
              MightBeMedia
            </a>
          </div>

          <p className="text-gold/90 font-medium">
            {BRAND.tagline} • Visakhapatnam, Andhra Pradesh
          </p>
        </div>
      </div>
    </footer>
  );
}
