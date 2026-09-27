import { Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/queries";
import { SectionHeading } from "./ProductRow";

export function CategoryStrip() {
  const { data: categories, isLoading } = useQuery(categoriesQuery());

  return (
    <section className="container-page py-6 sm:py-8">
      <SectionHeading
        title="Shop by Category"
        subtitle="Curated party decorations, return gifts, German silver & celebration essentials"
      />
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
            ))
          : (categories ?? []).map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group card-product card-product-hover flex flex-col items-center gap-2 p-2.5 sm:p-3.5 text-center transition-all duration-300"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFF8ED] p-2 flex items-center justify-center border border-[#F2ECE0]">
                  {c.image_url ? (
                    <SafeImage
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
                      {c.icon ?? "🎉"}
                    </span>
                  )}
                </div>
                <span className="line-clamp-2 text-xs sm:text-sm font-semibold leading-tight text-[#111B2E] group-hover:text-coral transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}
