import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type CategorySearch = { sub?: string };

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>): CategorySearch =>
    typeof search["sub"] === "string" ? { sub: search["sub"] } : {},
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — Vizag Party World` },
        { name: "description", content: `Shop ${pretty} online from Vizag Party World, Visakhapatnam.` },
        { property: "og:title", content: `${pretty} — Vizag Party World` },
        { property: "og:description", content: `Celebration essentials in ${pretty}.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { sub } = Route.useSearch();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ShopFilterState>({ sort: "relevance" });
  const { data: categories } = useQuery(categoriesQuery());
  const category = categories?.find((c) => c.slug === slug);
  const { data, isLoading } = useQuery(
    productsQuery({ ...filters, categorySlug: slug, ...(sub ? { subcategorySlug: sub } : {}) }),
  );

  return (
    <ShopLayout>
      <nav aria-label="Breadcrumb" className="container-page pt-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-pink">Home</Link> / <Link to="/categories" className="hover:text-pink">Categories</Link> /{" "}
        <span className="text-foreground">{category?.name ?? slug}</span>
      </nav>
      <PageHeader title={category?.name ?? "Category"} {...(category?.description ? { subtitle: category.description } : {})} />

      <div className="container-page py-5">
        {!!category?.subcategories?.length && (
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: {} })}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold",
                !sub ? "border-pink bg-pink text-primary-foreground" : "border-border",
              )}
            >
              All
            </button>
            {category.subcategories
              .filter((s) => s.is_active)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: { sub: s.slug } })}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold",
                    sub === s.slug ? "border-pink bg-pink text-primary-foreground" : "border-border",
                  )}
                >
                  {s.name}
                </button>
              ))}
          </div>
        )}

        <FilterBar value={filters} onChange={setFilters} total={data?.length ?? 0} />
        <ProductGrid products={data ?? []} loading={isLoading} />
      </div>
    </ShopLayout>
  );
}
