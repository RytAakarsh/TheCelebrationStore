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
    <article className={cn("card-product card-product-hover group relative flex flex-col overflow-hidden", className)}>
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
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:bg-card"
      >
        <Heart className={cn("h-4 w-4", saved ? "animate-pop fill-pink text-pink" : "text-muted-foreground")} />
      </button>

      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {off > 0 && (
          <span className="rounded-md bg-pink px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {off}% OFF
          </span>
        )}
        {product.is_bestseller && (
          <span className="rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-bold text-gold-foreground">
            BESTSELLER
          </span>
        )}
        {product.is_new && (
          <span className="rounded-md bg-purple px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">NEW</span>
        )}
        {lowStock && (
          <span className="rounded-md bg-orange px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            LOW STOCK
          </span>
        )}
      </div>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {primary ? (
            <>
              <SafeImage
                src={primary}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain p-3 transition-opacity duration-300 group-hover:opacity-0"
              />
              <SafeImage
                src={secondary ?? primary}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-[11px] font-semibold text-cream">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-pink">{product.name}</h3>
        </Link>
        {product.review_count > 0 && <StarRating value={Number(product.rating)} count={product.review_count} />}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold">{inr(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          {product.moq > 1 ? (
            <span className="text-[11px] font-medium text-muted-foreground">MOQ: {product.moq} pcs</span>
          ) : (
            <span />
          )}
          {colors.length > 0 && (
            <span className="flex gap-1">
              {colors.map((c) => (
                <span
                  key={c.id}
                  title={c.color_name ?? ""}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c.color_hex ?? undefined }}
                />
              ))}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant={outOfStock ? "soft" : "default"}
          className="mt-1 w-full"
          disabled={outOfStock || add.isPending}
          onClick={() => {
            if (!user) {
              toast.error("Please sign in to add items to your cart.");
              return;
            }
            add.mutate({ productId: product.id, quantity: Math.max(1, product.moq) });
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Sold out" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-product overflow-hidden">
      <div className="aspect-square animate-pulse bg-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="h-9 w-full animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
