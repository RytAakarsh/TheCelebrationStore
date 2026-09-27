import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { CardProduct } from "@/lib/queries";

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 sm:mb-6 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#111B2E]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProductRow({
  title,
  subtitle,
  products,
  loading,
  viewAllTo,
}: {
  title: string;
  subtitle?: string | null;
  products: CardProduct[];
  loading?: boolean;
  viewAllTo?: { to: string; params?: Record<string, string>; search?: Record<string, string> };
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="container-page py-5 sm:py-7">
      <SectionHeading
        title={title}
        subtitle={subtitle ?? null}
        action={
          viewAllTo ? (
            <Link
              to={viewAllTo.to as never}
              params={viewAllTo.params as never}
              search={viewAllTo.search as never}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-coral hover:bg-pink-soft/60 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5 md:gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[60vw] max-w-[210px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <ProductCardSkeleton />
              </div>
            ))
          : products.slice(0, 10).map((p) => (
              <div key={p.id} className="w-[60vw] max-w-[210px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}
