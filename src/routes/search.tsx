import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { SearchBar } from "@/components/shop/SearchBar";
import { productsQuery } from "@/lib/queries";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Search Products — Vizag Party World" },
      { name: "description", content: "Search balloons, return gifts, decorations and celebration supplies." },
      { property: "og:title", content: "Search Products — Vizag Party World" },
      { property: "og:description", content: "Find the perfect party supplies fast." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [filters, setFilters] = useState<ShopFilterState>({ sort: "relevance" });
  const { data, isLoading } = useQuery(productsQuery({ ...filters, ...(q ? { search: q } : {}), limit: q ? undefined : 24 }));

  return (
    <ShopLayout>
      <PageHeader title={q ? `Results for “${q}”` : "Search"} subtitle="Find exactly what your celebration needs" />
      <div className="container-page py-5">
        <div className="mb-4">
          <SearchBar initial={q ?? ""} autoFocus={!q} />
        </div>
        <FilterBar value={filters} onChange={setFilters} total={data?.length ?? 0} />
        <ProductGrid
          products={data ?? []}
          loading={isLoading}
          emptyTitle="No matching products"
          emptyText="Try a different word, or browse our categories."
        />
      </div>
    </ShopLayout>
  );
}
