import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterBar, type ShopFilterState } from "@/components/shop/FilterBar";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type CategorySearch = { sub?: string };

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>): CategorySearch =>
    typeof search["sub"] === "string" ? { sub: search["sub"] } : {},
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — ${BRAND.name}` },
        { name: "description", content: `Shop premium ${pretty} online from ${BRAND.name}, Visakhapatnam.` },
        { property: "og:title", content: `${pretty} — ${BRAND.name}` },
        { property: "og:description", content: `Celebration essentials & party supplies in ${pretty}.` },
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
      <nav aria-label="Breadcrumb" className="container-page pt-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/categories" className="hover:text-gold">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{category?.name ?? slug}</span>
      </nav>
      <PageHeader
        title={category?.name ?? "Category"}
        {...(category?.description ? { subtitle: category.description } : { subtitle: `Explore our collection of ${category?.name ?? slug}` })}
      />

      <div className="container-page py-5">
        {!!category?.subcategories?.length && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: {} })}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                !sub
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-background hover:bg-secondary",
              )}
            >
              All {category.name}
            </button>
            {category.subcategories
              .filter((s) => s.is_active)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: { sub: s.slug } })}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    sub === s.slug
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background hover:bg-secondary",
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
