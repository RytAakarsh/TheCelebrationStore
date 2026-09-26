import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { offerProductsQuery, productsQuery, liveOffersQuery } from "@/lib/queries";
import { BRAND } from "@/lib/brand";
import { Sparkles, Percent } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: `Special Offers & Festive Deals — ${BRAND.name}` },
      {
        name: "description",
        content: `Live discounts and celebratory offers on balloons, German silver return gifts, backdrops and party decorations from ${BRAND.name}.`,
      },
      { property: "og:title", content: `Special Offers & Festive Deals — ${BRAND.name}` },
      { property: "og:description", content: "Save more on your celebration shopping in Visakhapatnam." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const liveOffers = useQuery(liveOffersQuery());
  const offers = useQuery(offerProductsQuery());
  const discounted = useQuery(productsQuery({ minDiscount: 10, sort: "relevance" }));

  const list = offers.data?.length ? offers.data : (discounted.data ?? []);

  return (
    <ShopLayout>
      <PageHeader
        title="Special Offers & Festive Deals"
        subtitle="Exclusive discounts on party decorations, bulk return gifts, German silver pieces and celebration essentials."
      />

      {/* Promotional Banners if active */}
      {liveOffers.data && liveOffers.data.length > 0 && (
        <div className="container-page pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {liveOffers.data.map((offer) => (
              <div
                key={offer.id}
                className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-ink to-card p-6 text-cream shadow-md"
              >
                {offer.banner_url && (
                  <SafeImage
                    src={offer.banner_url}
                    alt={offer.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-20"
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-gold">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Active Celebration Offer</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl text-cream">{offer.name}</h3>
                  {offer.discount_value > 0 && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                      <Percent className="h-3.5 w-3.5" />
                      {offer.discount_type === "percent" ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-page py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Discounted Products</h2>
          <span className="text-xs text-muted-foreground">{list.length} celebration items</span>
        </div>
        <ProductGrid
          products={list}
          loading={offers.isLoading || discounted.isLoading}
          emptyTitle="No live offers right now"
          emptyText="New deals drop every festive season — check back soon or browse our full catalogue."
        />
      </div>
    </ShopLayout>
  );
}
