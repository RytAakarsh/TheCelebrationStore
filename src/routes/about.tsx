import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { BRAND, whatsappLink } from "@/lib/brand";
import { Sparkles, Gift, HeartHandshake, MapPin, Truck, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us — ${BRAND.name} | ${BRAND.tagline}` },
      {
        name: "description",
        content:
          "Welcome to The Celebration Store — your premier destination for balloons, party decorations, German silver return gifts and wedding essentials in Visakhapatnam, Andhra Pradesh.",
      },
      { property: "og:title", content: `About ${BRAND.name}` },
      { property: "og:description", content: BRAND.tagline },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <ShopLayout>
      <PageHeader
        title="About The Celebration Store"
        subtitle={BRAND.tagline}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About Us" }]}
      />

      <div className="container-page max-w-4xl py-10 space-y-12">
        {/* Brand Mission Statement */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-pink">
            <Sparkles className="h-4 w-4" /> Welcome to Our Store
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-snug">
            &ldquo;Welcome to The Celebration Store — your one-stop destination for making every celebration extra special!&rdquo;
          </h2>

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              From beautiful balloons and party decorations to German silver return gifts and unique celebration essentials, we have everything you need to make your occasions memorable. Whether it&apos;s a birthday, anniversary, baby shower, wedding, or any special event, we&apos;re here to add more colour, joy, and happiness to your celebrations.
            </p>
            <p>
              Based in the vibrant heart of Visakhapatnam at Poorna Market, we serve retail customers, event planners, families, and businesses across Andhra Pradesh and all of India with premium products and dependable service.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-gold">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Thoughtful Gifting</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Handpicked German silver sets, copper and white finish pots, Pichwai jars, and velvet return gift boxes designed to impress your guests.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink/15 text-pink">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Vibrant Decorations</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Metallic and chrome balloons, arch stands, LED props, custom birthday sets, floral backdrops, and theme party essentials.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple/15 text-purple">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Reliable Delivery</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Carefully packed shipments with flat ₹79 delivery across India and free shipping on orders over ₹999.
            </p>
          </div>
        </div>

        {/* Store Location & Connect Card */}
        <div className="surface-ink rounded-3xl p-6 sm:p-10 border border-gold/25 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold">Visit Us In Person</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">Our Visakhapatnam Store</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-cream/90 text-sm">
            <div className="space-y-3">
              <p className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                <span>
                  <strong>Party World</strong>
                  <br />Poorna Market
                  <br />Visakhapatnam - 530001
                  <br />Andhra Pradesh, India
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:+91${BRAND.phone}`} className="hover:text-gold">{BRAND.phoneDisplay}</a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-gold">{BRAND.email}</a>
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button asChild variant="gold" className="rounded-full shadow-gold">
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/20 text-cream hover:bg-white/10">
              <Link to="/shop">Explore Our Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
