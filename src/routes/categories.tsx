import { createFileRoute, Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { categoriesQuery } from "@/lib/queries";
import { BRAND } from "@/lib/brand";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: `All Categories — ${BRAND.name}` },
      {
        name: "description",
        content: `Explore balloons, German silver return gifts, party decor, fancy return gift bags, backdrops and wedding essentials from ${BRAND.name}, Visakhapatnam.`,
      },
      { property: "og:title", content: `All Categories — ${BRAND.name}` },
      { property: "og:description", content: "Shop celebration categories curated for every occasion." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(categoriesQuery());

  return (
    <ShopLayout>
      <PageHeader
        title="Celebration Categories"
        subtitle="Explore our handcrafted collections designed for birthdays, weddings, baby showers, anniversaries and divine festivities."
      />
      <div className="container-page grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-secondary" />
            ))
          : (categories ?? []).map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-gold/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-secondary text-3xl shadow-xs transition-transform group-hover:scale-105">
                      {c.image_url ? (
                        <SafeImage
                          src={c.image_url}
                          alt={c.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span aria-hidden>{c.icon ?? "🎉"}</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        className="font-display text-lg font-bold text-foreground transition-colors hover:text-pink"
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="line-clamp-2 mt-1 text-xs text-muted-foreground">{c.description}</p>
                      )}
                    </div>
                  </div>

                  {!!c.subcategories?.length && (
                    <div className="mt-4 border-t border-border/60 pt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Popular Subcategories
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {c.subcategories
                          .filter((s) => s.is_active)
                          .slice(0, 5)
                          .map((s) => (
                            <li key={s.id}>
                              <Link
                                to="/category/$slug"
                                params={{ slug: c.slug }}
                                search={{ sub: s.slug }}
                                className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-gold hover:bg-gold/10"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        {c.subcategories.length > 5 && (
                          <li className="text-xs text-muted-foreground flex items-center px-1">
                            +{c.subcategories.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="inline-flex items-center text-xs font-semibold text-gold transition-colors hover:text-gold/80"
                  >
                    Browse {c.name} <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </ShopLayout>
  );
}
