import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { CategoryStrip } from "@/components/shop/CategoryStrip";
import { TrustBar } from "@/components/shop/TrustBar";
import { ProductRow } from "@/components/shop/ProductRow";
import { SearchBar } from "@/components/shop/SearchBar";
import { homeSectionsQuery, offerProductsQuery, productsQuery } from "@/lib/queries";
import { BRAND, whatsappLink } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vizag Party World — Balloons, Decorations & Return Gifts in Visakhapatnam" },
      {
        name: "description",
        content:
          "Shop balloons, birthday decorations, German silver return gifts, wedding decor and celebration essentials from Vizag Party World, Poorna Market, Visakhapatnam.",
      },
      { property: "og:title", content: "Vizag Party World — Make Every Moment Special" },
      {
        property: "og:description",
        content: "Party supplies, decorations and return gifts for birthdays, weddings and every celebration.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: sections } = useQuery(homeSectionsQuery());
  const featured = useQuery(productsQuery({ badge: "featured", limit: 10 }));
  const bestsellers = useQuery(productsQuery({ badge: "bestseller", limit: 10 }));
  const newArrivals = useQuery(productsQuery({ sort: "newest", limit: 10 }));
  const trending = useQuery(productsQuery({ badge: "trending", limit: 10 }));
  const offers = useQuery(offerProductsQuery());

  const titleFor = (key: string, fallback: string) => sections?.find((s) => s.key === key)?.title ?? fallback;
  const subFor = (key: string) => sections?.find((s) => s.key === key)?.subtitle ?? null;

  return (
    <ShopLayout>
      <div className="container-page pt-3 lg:hidden">
        <SearchBar />
      </div>

      <HeroCarousel />
      <CategoryStrip />

      <ProductRow
        title={titleFor("featured", "Featured Picks")}
        subtitle={subFor("featured")}
        products={featured.data ?? []}
        loading={featured.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      {offers.data && offers.data.length > 0 && (
        <ProductRow
          title="Live Offers"
          subtitle="Limited period celebration deals"
          products={offers.data}
          loading={offers.isLoading}
          viewAllTo={{ to: "/offers" }}
        />
      )}

      <ProductRow
        title={titleFor("bestsellers", "Bestsellers")}
        subtitle={subFor("bestsellers")}
        products={bestsellers.data ?? []}
        loading={bestsellers.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      <section className="container-page py-6">
        <div className="surface-ink overflow-hidden rounded-2xl p-6 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">Planning a big celebration?</h2>
          <p className="mt-2 max-w-xl text-sm text-cream/80">
            Birthday parties, baby showers, weddings and corporate events — we help with bulk supplies, custom decor
            and complete setups across Visakhapatnam.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <a href={whatsappLink("Hello Vizag Party World, I need help planning an event.")} target="_blank" rel="noreferrer">
                WhatsApp {BRAND.phoneDisplay}
              </a>
            </Button>
            <Button asChild variant="ink" size="lg">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      <ProductRow
        title={titleFor("new_arrivals", "New Arrivals")}
        subtitle={subFor("new_arrivals")}
        products={newArrivals.data ?? []}
        loading={newArrivals.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      <ProductRow
        title={titleFor("trending", "Trending Now")}
        subtitle={subFor("trending")}
        products={trending.data ?? []}
        loading={trending.isLoading}
        viewAllTo={{ to: "/shop" }}
      />

      <TrustBar />
    </ShopLayout>
  );
}
