import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Party Supplies — Vizag Party World" },
      {
        name: "description",
        content:
          "Browse all balloons, decorations, return gifts, bags, backdrops and wedding essentials from Vizag Party World.",
      },
      { property: "og:title", content: "Shop All Party Supplies — Vizag Party World" },
      { property: "og:description", content: "Every celebration essential in one place." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [filters, setFilters] = useState<ShopFilterState>({ sort: "relevance" });
  const { data, isLoading } = useQuery(productsQuery(filters));

  return (
    <ShopLayout>
      <PageHeader title="Shop All" subtitle="Everything you need to make every moment special" />
      <div className="container-page py-5">
        <FilterBar value={filters} onChange={setFilters} total={data?.length ?? 0} />
        <ProductGrid products={data ?? []} loading={isLoading} />
      </div>
    </ShopLayout>
  );
}
