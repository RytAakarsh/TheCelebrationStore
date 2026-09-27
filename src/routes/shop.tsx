import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { productsQuery, categoriesQuery } from "@/lib/queries";
import { BRAND } from "@/lib/brand";
import { SafeImage } from "@/components/shop/SafeImage";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: `Shop All Party Supplies & Gifts — ${BRAND.name}` },
      {
        name: "description",
        content:
          `Browse all balloons, decorations, German silver return gifts, pouches, backdrops and celebration essentials from ${BRAND.name}, Visakhapatnam.`,
      },
      { property: "og:title", content: `Shop All Party Supplies & Gifts — ${BRAND.name}` },
      { property: "og:description", content: "Every celebration essential in one place. Make Every Moment Special." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [filters, setFilters] = useState<ShopFilterState>({ sort: "relevance" });
  const { data: products, isLoading } = useQuery(productsQuery(filters));
  const { data: categories } = useQuery(categoriesQuery());

  return (
    <ShopLayout>
      <PageHeader
        title="Shop All Celebrations"
        subtitle="From balloons and party decorations to German silver return gifts — everything to make your moments unforgettable."
      />

      {/* Category Pills Strip */}
      {categories && categories.length > 0 && (
        <div className="border-b border-border bg-card/60 py-4">
          <div className="container-page">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, category: undefined }))}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  !filters.category
                    ? "bg-[image:var(--gradient-gold)] text-[#111B2E] font-bold shadow-xs"
                    : "border border-border bg-white text-[#111B2E] hover:bg-secondary"
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug }))}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    filters.category === cat.slug
                      ? "bg-[image:var(--gradient-gold)] text-[#111B2E] font-bold shadow-xs"
                      : "border border-border bg-white text-[#111B2E] hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-page py-6">
        <FilterBar value={filters} onChange={setFilters} total={products?.length ?? 0} />
        <ProductGrid products={products ?? []} loading={isLoading} />
      </div>
    </ShopLayout>
  );
}
