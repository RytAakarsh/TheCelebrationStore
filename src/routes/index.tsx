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
import { Sparkles, Gift, Heart, ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.tagline} | Balloons, Return Gifts & Celebration Essentials` },
      {
        name: "description",
        content:
          "Welcome to The Celebration Store — your one-stop destination for balloons, party decorations, German silver return gifts, wedding essentials and celebration supplies. Make Every Moment Special.",
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
      <div className="container-page pt-3.5 pb-1 lg:hidden">
        <SearchBar />
      </div>

      {/* Dynamic Hero Carousel */}
      <HeroCarousel />

      {/* Quick Visual Category Navigation */}
      <CategoryStrip />

      {/* Live Offers Section */}
      {offers.data && offers.data.length > 0 && (
        <div className="bg-gradient-to-r from-pink/5 via-gold/5 to-purple/5 py-4 my-2 border-y border-pink/10">
          <ProductRow
            title="Live Celebration Deals 🔥"
            subtitle="Limited-time offers on top party supplies & gifts"
            products={offers.data}
            loading={offers.isLoading}
            viewAllTo={{ to: "/offers" }}
          />
        </div>
      )}

      {/* Featured Picks */}
      <ProductRow
        title={titleFor("featured", "Featured Picks")}
        subtitle={subFor("featured") || "Handpicked celebration essentials loved by our team"}
        products={featured.data ?? []}
        loading={featured.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Best Sellers */}
      <ProductRow
        title={titleFor("bestsellers", "Best Sellers")}
        subtitle={subFor("bestsellers") || "Our most popular party decorations & return gifts"}
        products={bestsellers.data ?? []}
        loading={bestsellers.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Curated Celebration Showcase Banner */}
      <section className="container-page py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D1B36] to-[#120D1A] p-6 sm:p-8 text-cream flex flex-col justify-between shadow-md border border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                <Gift className="h-3.5 w-3.5" /> Return Gifts Boutique
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
                German Silver &amp; Traditional Gifts
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-cream/80 max-w-sm">
                Make your guests feel truly cherished with authentic German silver plates, bowls, kumkum boxes and Pichwai return gifts.
              </p>
            </div>
            <div className="mt-6">
              <Button asChild variant="gold" size="sm" className="rounded-full shadow-gold">
                <Link to="/category/$slug" params={{ slug: "return-gifts" }}>
                  Explore Return Gifts <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A2639] to-[#0E1522] p-6 sm:p-8 text-cream flex flex-col justify-between shadow-md border border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pink/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink">
                <Sparkles className="h-3.5 w-3.5" /> Party &amp; Birthday
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
                Balloons, Kits &amp; Event Decor
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-cream/80 max-w-sm">
                Chrome balloons, arch stands, sparklers, candles, and photo backdrops to turn any venue into an unforgettable celebration.
              </p>
            </div>
            <div className="mt-6">
              <Button asChild className="rounded-full bg-pink text-white hover:bg-pink/90 shadow-pink" size="sm">
                <Link to="/category/$slug" params={{ slug: "birthday-party" }}>
                  Shop Birthday Supplies <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Birthday & Party Showcase */}
      {birthdayParty.data && birthdayParty.data.length > 0 && (
        <ProductRow
          title="Birthday &amp; Party Essentials"
          subtitle="Balloons, candles, backdrops and decoration kits"
          products={birthdayParty.data}
          loading={birthdayParty.isLoading}
          viewAllTo={{ to: "/category/$slug", params: { slug: "birthday-party" } }}
        />
      )}

      {/* Return Gifts Showcase */}
      {returnGifts.data && returnGifts.data.length > 0 && (
        <ProductRow
          title="Return Gifts Collection"
          subtitle="Memorable favors for weddings, poojas, and housewarmings"
          products={returnGifts.data}
          loading={returnGifts.isLoading}
          viewAllTo={{ to: "/category/$slug", params: { slug: "return-gifts" } }}
        />
      )}

      {/* German Silver Showcase */}
      {germanSilver.data && germanSilver.data.length > 0 && (
        <ProductRow
          title="German Silver Gifting"
          subtitle="Premium plates, bowls, cups and pooja items"
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
        subtitle={subFor("trending") || "Celebration items trending this season"}
        products={trending.data ?? []}
        loading={trending.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {/* Event Planning WhatsApp Callout */}
      <section className="container-page py-8">
        <div className="surface-ink relative overflow-hidden rounded-3xl p-6 sm:p-12 shadow-lift border border-gold/20">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold">
              Visakhapatnam Store &amp; Bulk Orders
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-4xl">
              Planning a wedding, birthday or special event?
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-cream/85">
              From bulk balloon orders and return gift customization to complete celebration supplies across Visakhapatnam and pan-India shipping, we are here to help make every moment special.
            </p>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <Button asChild variant="gold" size="lg" className="rounded-full shadow-gold">
                <a
                  href={whatsappLink(`Hello ${BRAND.name}, I would like assistance with an upcoming event / bulk celebration order.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat on WhatsApp ({BRAND.phone})</span>
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/25 text-cream hover:bg-white/10">
                <Link to="/contact">Visit Our Poorna Market Store</Link>
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        </div>
      </section>

      {/* Trust & Guarantees */}
      <TrustBar />
    </ShopLayout>
  );
}
