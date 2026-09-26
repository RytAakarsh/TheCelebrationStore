import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { SearchBar } from "@/components/shop/SearchBar";
import { productsQuery } from "@/lib/queries";
import { BRAND } from "@/lib/brand";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: `Search Party & Celebration Products — ${BRAND.name}` },
      { name: "description", content: `Search balloons, return gifts, German silver, decorations and celebration supplies from ${BRAND.name}.` },
      { property: "og:title", content: `Search Products — ${BRAND.name}` },
      { property: "og:description", content: "Find the perfect celebration supplies fast." },
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
      <PageHeader
        title={q ? `Results for “${q}”` : "Search Catalogue"}
        subtitle="Find balloons, return gifts, themed party decor, and celebration essentials."
      />
      <div className="container-page py-6">
        <div className="mb-6 max-w-2xl mx-auto">
          <SearchBar initial={q ?? ""} autoFocus={!q} />
        </div>
        <FilterBar value={filters} onChange={setFilters} total={data?.length ?? 0} />
        <ProductGrid
          products={data ?? []}
          loading={isLoading}
          emptyTitle="No matching products found"
          emptyText={`We couldn't find any items matching "${q || ''}". Try searching for 'balloons', 'foil', 'german silver', 'birthday', or browse our category collections.`}
        />
      </div>
    </ShopLayout>
  );
}
