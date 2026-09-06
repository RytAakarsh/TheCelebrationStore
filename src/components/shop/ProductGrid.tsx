import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { CardProduct } from "@/lib/queries";
import { EmptyState } from "./ShopLayout";

export function ProductGrid({
  products,
  loading,
  emptyTitle = "No products found",
  emptyText = "Try changing filters or search for something else.",
}: {
  products: CardProduct[];
  loading?: boolean;
  emptyTitle?: string;
  emptyText?: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!products.length) return <EmptyState title={emptyTitle} description={emptyText} />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
