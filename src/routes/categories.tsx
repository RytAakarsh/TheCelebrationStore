import { createFileRoute, Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — Vizag Party World" },
      {
        name: "description",
        content: "Explore balloons, German silver gifts, return gifts, bags, backdrops and wedding categories.",
      },
      { property: "og:title", content: "All Categories — Vizag Party World" },
      { property: "og:description", content: "Shop celebration categories curated for every occasion." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(categoriesQuery());

  return (
    <ShopLayout>
      <PageHeader title="Categories" subtitle="Find exactly what your celebration needs" />
      <div className="container-page grid gap-4 py-5 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />)
          : (categories ?? []).map((c) => (
              <div key={c.id} className="card-product overflow-hidden p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-2xl">
                    {c.image_url ? (
                      <SafeImage src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden>{c.icon ?? "🎉"}</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <Link to="/category/$slug" params={{ slug: c.slug }} className="font-display text-lg font-bold hover:text-pink">
                      {c.name}
                    </Link>
                    {c.description && <p className="line-clamp-2 text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                </div>
                {!!c.subcategories?.length && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.subcategories
                      .filter((s) => s.is_active)
                      .map((s) => (
                        <li key={s.id}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            search={{ sub: s.slug }}
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-gold"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
      </div>
    </ShopLayout>
  );
}
