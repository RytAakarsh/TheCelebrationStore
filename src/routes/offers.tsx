import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { offerProductsQuery, productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals — Vizag Party World" },
      { name: "description", content: "Live discounts on balloons, return gifts and party decorations." },
      { property: "og:title", content: "Offers & Deals — Vizag Party World" },
      { property: "og:description", content: "Save more on your celebration shopping." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const offers = useQuery(offerProductsQuery());
  const discounted = useQuery(productsQuery({ minDiscount: 10, sort: "relevance" }));

  const list = offers.data?.length ? offers.data : (discounted.data ?? []);

  return (
    <ShopLayout>
      <PageHeader title="Offers & Deals" subtitle="Limited period celebration savings" />
      <div className="container-page py-5">
        <ProductGrid
          products={list}
          loading={offers.isLoading || discounted.isLoading}
          emptyTitle="No live offers right now"
          emptyText="New deals drop every festive season — check back soon."
        />
      </div>
    </ShopLayout>
  );
}
