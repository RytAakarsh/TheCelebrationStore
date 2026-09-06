import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/queries";
import { SectionHeading } from "./ProductRow";

export function CategoryStrip() {
  const { data: categories, isLoading } = useQuery(categoriesQuery());

  return (
    <section className="container-page py-6">
      <SectionHeading title="Shop by Category" subtitle="Everything you need for the perfect celebration" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
            ))
          : (categories ?? []).map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group card-product card-product-hover flex flex-col items-center gap-2 p-3 text-center"
              >
                <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-secondary text-3xl">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden>{c.icon ?? "🎉"}</span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-tight group-hover:text-pink">{c.name}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
