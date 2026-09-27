import { Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { discountPercent, inr } from "@/lib/format";
import type { CardProduct } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product, className }: { product: CardProduct; className?: string }) {
  const images = [...(product.product_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
  const primary = images[0]?.url;
  const secondary = images[1]?.url;
  const off = discountPercent(product.mrp, product.price);
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const { user } = useAuth();
  const saved = ids.has(product.id);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const colors = (product.product_variants ?? []).filter((v) => v.color_hex).slice(0, 5);

  return (
    <article className={cn("card-product card-product-hover group relative flex flex-col overflow-hidden bg-white", className)}>
      {/* Floating Wishlist Button */}
      <button
        type="button"
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => {
          if (!user) {
            toast.error("Please sign in to save favourites.");
            return;
          }
          toggle.mutate(product.id);
        }}
        className="absolute right-2.5 top-2.5 z-10 grid h-8.5 w-8.5 place-items-center rounded-full bg-white/90 shadow-sm border border-[#EDE7DC] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95"
      >
        <Heart className={cn("h-4 w-4 transition-colors", saved ? "animate-pop fill-pink text-pink" : "text-muted-foreground hover:text-pink")} />
      </button>

      {/* Floating Offer & Status Badges */}
      <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1 items-start">
        {off > 0 && (
          <span className="rounded-md bg-[image:var(--gradient-coral)] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            {off}% OFF
          </span>
        )}
        {product.is_bestseller && (
          <span className="rounded-md bg-[image:var(--gradient-gold)] px-2 py-0.5 text-[10px] font-bold text-[#111B2E] shadow-xs">
            BESTSELLER
          </span>
        )}
        {product.is_new && (
          <span className="rounded-md bg-sky px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">NEW</span>
        )}
        {lowStock && (
          <span className="rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            LOW STOCK
          </span>
        )}
      </div>

      {/* Product Image Area */}
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-[#FFFDF8] to-[#FFF8ED] p-3 flex items-center justify-center">
          {primary ? (
            <>
              <SafeImage
                src={primary}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
              />
              <SafeImage
                src={secondary ?? primary}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-3 opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
              />
            </>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">No image available</div>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-[#111B2E]/90 py-1 text-center text-[11px] font-semibold text-white backdrop-blur-xs">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Details & Action */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5 border-t border-[#F2ECE0]">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="min-w-0">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-[#111B2E] group-hover:text-coral transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.review_count > 0 && <StarRating value={Number(product.rating)} count={product.review_count} />}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-sm sm:text-base font-bold text-[#111B2E]">{inr(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>}
        </div>

        <div className="flex items-center justify-between gap-2 min-h-4 text-[11px]">
          {product.moq > 1 ? (
            <span className="font-medium text-muted-foreground">MOQ: {product.moq} pcs</span>
          ) : (
            <span />
          )}
          {colors.length > 0 && (
            <span className="flex gap-1">
              {colors.map((c) => (
                <span
                  key={c.id}
                  title={c.color_name ?? ""}
                  className="h-3 w-3 rounded-full border border-border shadow-xs"
                  style={{ backgroundColor: c.color_hex ?? undefined }}
                />
              ))}
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant={outOfStock ? "outline" : "gold"}
          className="mt-1.5 w-full rounded-xl"
          disabled={outOfStock || add.isPending}
          onClick={() => {
            if (!user) {
              toast.error("Please sign in to add items to your cart.");
              return;
            }
            add.mutate({ productId: product.id, quantity: Math.max(1, product.moq) });
          }}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{outOfStock ? "Sold out" : "Add to Cart"}</span>
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-product overflow-hidden bg-white">
      <div className="aspect-square animate-pulse bg-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded-lg bg-secondary" />
        <div className="h-3.5 w-1/2 animate-pulse rounded-lg bg-secondary" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}
