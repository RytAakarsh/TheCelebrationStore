import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { CategoryStrip } from "@/components/shop/CategoryStrip";
import { TrustBar } from "@/components/shop/TrustBar";
import { ProductRow } from "@/components/shop/ProductRow";
import { SearchBar } from "@/components/shop/SearchBar";
import { homeSectionsQuery, offerProductsQuery, productsQuery, categoriesQuery } from "@/lib/queries";
import { BRAND, whatsappLink } from "@/lib/brand";
import { Sparkles, Gift, ArrowRight, MessageCircle, MapPin, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.tagline} | Balloons, Return Gifts & Celebration Essentials` },
      {
        name: "description",
        content:
          "Welcome to The Celebration Store — your one-stop destination for balloons, party decorations, German silver return gifts, wedding essentials and celebration supplies in Visakhapatnam and pan-India.",
      },
      { property: "og:title", content: `${BRAND.name} — ${BRAND.tagline}` },
      {
        property: "og:description",
        content: "From beautiful balloons to German silver return gifts and celebration essentials, we have everything you need.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: sections } = useQuery(homeSectionsQuery());
  const { data: categories } = useQuery(categoriesQuery());
  const featured = useQuery(productsQuery({ badge: "featured", limit: 12 }));
  const bestsellers = useQuery(productsQuery({ badge: "bestseller", limit: 12 }));
  const newArrivals = useQuery(productsQuery({ sort: "newest", limit: 12 }));
  const trending = useQuery(productsQuery({ badge: "trending", limit: 12 }));
  const offers = useQuery(offerProductsQuery());

  const returnGifts = useQuery(productsQuery({ categorySlug: "return-gifts", limit: 8 }));
  const germanSilver = useQuery(productsQuery({ categorySlug: "german-silver", limit: 8 }));
  const birthdayParty = useQuery(productsQuery({ categorySlug: "birthday-party", limit: 8 }));

  const titleFor = (key: string, fallback: string) => sections?.find((s) => s.key === key)?.title ?? fallback;
  const subFor = (key: string) => sections?.find((s) => s.key === key)?.subtitle ?? null;

  return (
    <ShopLayout>
      {/* Mobile Search Bar */}
      <div className="container-page pt-3 pb-1 lg:hidden">
        <SearchBar />
      </div>

      {/* Official Brand Hero Carousel */}
      <HeroCarousel />

      {/* Category Navigation Strip */}
      <CategoryStrip />

      {/* Live Celebration Deals */}
      {offers.data && offers.data.length > 0 && (
        <div className="bg-gradient-to-r from-coral/5 via-gold/5 to-sky/5 py-4 my-2 border-y border-coral/15">
          <ProductRow
            title="Live Celebration Deals 🔥"
            subtitle="Limited-time festive discounts on balloons, return gifts & decor"
            products={offers.data}
            loading={offers.isLoading}
            viewAllTo={{ to: "/offers" }}
          />
        </div>
      )}

      {/* Featured Picks */}
      <ProductRow
        title={titleFor("featured", "Featured Picks")}
        subtitle={subFor("featured") || "Handpicked celebration essentials loved by our customers"}
        products={featured.data ?? []}
        loading={featured.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Best Sellers */}
      <ProductRow
        title={titleFor("bestsellers", "Best Sellers")}
        subtitle={subFor("bestsellers") || "Our top-selling party decorations & return gifts"}
        products={bestsellers.data ?? []}
        loading={bestsellers.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Curated Celebration Showcase Banners */}
      <section className="container-page py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Banner 1: Return Gifts Boutique */}
          <div className="relative overflow-hidden rounded-3xl surface-navy p-6 sm:p-9 text-white flex flex-col justify-between shadow-lift border border-gold/30 group">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/30">
                <Gift className="h-3.5 w-3.5" /> Return Gifts Boutique
              </span>
              <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                German Silver &amp; Traditional Gifts
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-cream/85 max-w-md leading-relaxed">
                Make your guests remember your special moments forever with authentic German silver plates, bowls, kumkum boxes, and curated celebration favor boxes.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              <Button asChild variant="gold" size="lg" className="rounded-full">
                <Link to="/category/$slug" params={{ slug: "return-gifts" }}>
                  <span>Explore Return Gifts</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {/* Background Glow */}
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-gold/15 blur-3xl transition-transform duration-500 group-hover:scale-110" />
          </div>

          {/* Banner 2: Party & Birthday Decor */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#201018] via-[#2A1420] to-[#120810] p-6 sm:p-9 text-white flex flex-col justify-between shadow-lift border border-coral/30 group">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral border border-coral/30">
                <Sparkles className="h-3.5 w-3.5" /> Party &amp; Birthday
              </span>
              <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Balloons, Kits &amp; Event Decor
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-cream/85 max-w-md leading-relaxed">
                Chrome balloons, arch stands, foil curtains, sparklers, and photo backdrops to turn any room into an extraordinary celebration.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              <Button asChild variant="coral" size="lg" className="rounded-full">
                <Link to="/category/$slug" params={{ slug: "birthday-party" }}>
                  <span>Shop Birthday Supplies</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {/* Background Glow */}
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-coral/15 blur-3xl transition-transform duration-500 group-hover:scale-110" />
          </div>
        </div>
      </section>

      {/* Birthday & Party Showcase */}
      {birthdayParty.data && birthdayParty.data.length > 0 && (
        <ProductRow
          title="Birthday &amp; Party Essentials"
          subtitle="Balloons, candles, backdrops, and complete decoration kits"
          products={birthdayParty.data}
          loading={birthdayParty.isLoading}
          viewAllTo={{ to: "/category/$slug", params: { slug: "birthday-party" } }}
        />
      )}

      {/* Return Gifts Showcase */}
      {returnGifts.data && returnGifts.data.length > 0 && (
        <ProductRow
          title="Return Gifts Collection"
          subtitle="Memorable favors for weddings, poojas, baby showers & housewarmings"
          products={returnGifts.data}
          loading={returnGifts.isLoading}
          viewAllTo={{ to: "/category/$slug", params: { slug: "return-gifts" } }}
        />
      )}

      {/* German Silver Showcase */}
      {germanSilver.data && germanSilver.data.length > 0 && (
        <ProductRow
          title="German Silver Gifting"
          subtitle="Premium plates, bowls, cups, diyas and auspicious pooja items"
          products={germanSilver.data}
          loading={germanSilver.isLoading}
          viewAllTo={{ to: "/category/$slug", params: { slug: "german-silver" } }}
        />
      )}

      {/* New Arrivals */}
      <ProductRow
        title={titleFor("new_arrivals", "New Arrivals")}
        subtitle={subFor("new_arrivals") || "Freshly added celebration supplies and novelties"}
        products={newArrivals.data ?? []}
        loading={newArrivals.isLoading}
        viewAllTo={{ to: "/shop", search: { sort: "newest" } }}
      />

      {/* Trending Now */}
      <ProductRow
        title={titleFor("trending", "Trending Now")}
        subtitle={subFor("trending") || "Popular party supplies and gifts trending this season"}
        products={trending.data ?? []}
        loading={trending.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Large Event Planning & Store CTA Section */}
      <section className="container-page py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl surface-navy p-6 sm:p-12 shadow-lift border border-gold/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                <PartyPopper className="h-3.5 w-3.5" /> VISAKHAPATNAM STORE &amp; BULK ORDERS
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Planning a wedding, birthday<br className="hidden sm:inline" /> or special event?
              </h2>
              <p className="mt-3.5 text-xs sm:text-sm md:text-base leading-relaxed text-cream/90 max-w-xl">
                From bulk balloon orders and return gift customization to complete celebration supplies across Visakhapatnam and pan-India shipping, we are here to help make every moment special.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3.5">
                <Button asChild variant="gold" size="lg" className="rounded-full">
                  <a
                    href={whatsappLink(`Hello ${BRAND.name}, I would like assistance with an upcoming event / bulk celebration order.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10">
                  <Link to="/contact">
                    <MapPin className="h-4 w-4 mr-1 text-gold" />
                    <span>Visit Our Poorna Market Store</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Decorative Composition */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-white/10 via-gold/10 to-transparent p-6 border border-white/15 backdrop-blur-md flex flex-col justify-between shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-gold/20 px-3 py-1 text-xs font-bold text-gold">
                    ✨ Party World
                  </span>
                  <span className="text-xs text-cream/70">Est. Poorna Market</span>
                </div>
                <div className="my-auto text-center space-y-2 py-4">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[image:var(--gradient-gold)] text-[#111B2E] shadow-gold">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">Make Every Moment Special</h4>
                  <p className="text-xs text-cream/80 max-w-xs mx-auto">
                    Balloons • Return Gifts • German Silver • Party Decor • Pan-India Delivery
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-cream/70">
                  <span>Fast Dispatch</span>
                  <span>•</span>
                  <span>100% Authentic</span>
                  <span>•</span>
                  <span>Bulk Discounts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <TrustBar />
    </ShopLayout>
  );
}
