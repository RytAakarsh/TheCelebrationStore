import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Minus, MessageCircle, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopLayout, EmptyState } from "@/components/shop/ShopLayout";
import { ProductRow } from "@/components/shop/ProductRow";
import { StarRating } from "@/components/shop/StarRating";
import { productQuery, productsQuery, reviewsQuery, type Variant } from "@/lib/queries";
import { discountPercent, formatDayIST, inr } from "@/lib/format";
import { BRAND, productWhatsappLink } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — Vizag Party World` },
        { name: "description", content: `Buy ${pretty} online from Vizag Party World, Visakhapatnam.` },
        { property: "og:title", content: `${pretty} — Vizag Party World` },
        { property: "og:description", content: `Buy ${pretty} for your next celebration.` },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: reviews } = useQuery(reviewsQuery(product?.id));
  const related = useQuery(productsQuery({ limit: 10, sort: "bestselling" }));
  const { user } = useAuth();
  const { add } = useCart();
  const { ids, toggle } = useWishlist();

  const variants = useMemo(
    () => (product?.product_variants ?? []).filter((v) => v.is_active).sort((a, b) => a.position - b.position),
    [product],
  );
  const [variantId, setVariantId] = useState<string | null>(null);
  const variant: Variant | undefined = variants.find((v) => v.id === variantId) ?? undefined;

  const price = Number(variant?.price ?? product?.price ?? 0);
  const mrp = Number(variant?.mrp ?? product?.mrp ?? 0);
  const stock = Number(variant?.stock ?? product?.stock ?? 0);
  const moq = Number(variant?.moq ?? product?.moq ?? 1);
  const [qty, setQty] = useState(1);
  const quantity = Math.max(qty, moq);

  const images = useMemo(() => {
    const variantImgs = (variant?.variant_images ?? []).map((v) => v.url);
    const base = [...(product?.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
      .map((i) => i.url);
    return [...variantImgs, ...base];
  }, [product, variant]);
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="container-page grid gap-6 py-6 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-secondary" />
          <div className="space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-24 w-full animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (!product || !product.is_published || product.is_archived) {
    return (
      <ShopLayout>
        <EmptyState
          title="Product not available"
          description="This product may have been removed or is no longer published."
          action={
            <Button asChild variant="hero">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  const off = discountPercent(mrp, price);
  const saved = ids.has(product.id);
  const outOfStock = stock <= 0;

  return (
    <ShopLayout>
      <nav aria-label="Breadcrumb" className="container-page pt-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-pink">Home</Link>
        {product.categories && (
          <>
            {" / "}
            <Link to="/category/$slug" params={{ slug: product.categories.slug }} className="hover:text-pink">
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="container-page grid gap-8 py-5 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {images[active] ? (
              <img src={images[active]} alt={product.name} className="aspect-square w-full object-contain p-4" />
            ) : (
              <div className="grid aspect-square place-items-center text-sm text-muted-foreground">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-card",
                    i === active ? "border-gold" : "border-border",
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {product.review_count > 0 && <StarRating value={Number(product.rating)} count={product.review_count} />}
            {product.sold_count > 0 && (
              <span className="text-xs text-muted-foreground">{product.sold_count} sold</span>
            )}
            {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold">{inr(price)}</span>
            {off > 0 && (
              <>
                <span className="text-base text-muted-foreground line-through">{inr(mrp)}</span>
                <span className="rounded-md bg-pink px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {off}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          {product.short_description && <p className="mt-4 text-sm text-muted-foreground">{product.short_description}</p>}

          {variants.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide">Choose an option</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVariantId(v.id === variantId ? null : v.id);
                      setActive(0);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
                      v.id === variantId ? "border-pink bg-pink/10" : "border-border",
                      v.stock <= 0 && "opacity-50",
                    )}
                  >
                    {v.color_hex && (
                      <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: v.color_hex }} />
                    )}
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(moq, quantity - 1))}
                className="grid h-11 w-11 place-items-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(quantity + 1)}
                className="grid h-11 w-11 place-items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {moq > 1 && <span className="text-xs font-semibold text-orange">Minimum order: {moq} pcs</span>}
            <span className={cn("text-xs font-semibold", outOfStock ? "text-destructive" : "text-success")}>
              {outOfStock ? "Out of stock" : stock <= 5 ? `Only ${stock} left` : "In stock"}
            </span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              size="lg"
              variant="hero"
              disabled={outOfStock || add.isPending}
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to add items to your cart.");
                  return;
                }
                add.mutate({ productId: product.id, variantId, quantity });
              }}
            >
              Add to Cart
            </Button>
            <Button asChild size="lg" variant="soft">
              <a href={productWhatsappLink(product.name)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
              </a>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="sm:col-span-2"
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to save favourites.");
                  return;
                }
                toggle.mutate(product.id);
              }}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-pink text-pink")} />
              {saved ? "Saved to wishlist" : "Add to wishlist"}
            </Button>
          </div>

          <ul className="mt-5 grid gap-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold" /> Fast delivery across Visakhapatnam
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" /> Quality checked before dispatch
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gold" /> Bulk orders: call {BRAND.phoneDisplay}
            </li>
          </ul>

          <Tabs defaultValue="description" className="mt-8">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-3 text-sm leading-relaxed text-muted-foreground">
              {product.description ?? product.short_description ?? "Details coming soon."}
              {!!product.tags?.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="space-y-3 pt-3">
              {!reviews?.length && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
              {(reviews ?? []).map((r) => (
                <div key={r.id} className="card-product p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{r.customer_name ?? "Customer"}</span>
                    <span className="text-xs text-muted-foreground">{formatDayIST(r.created_at)}</span>
                  </div>
                  <StarRating value={Number(r.rating)} className="mt-1" />
                  {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
                  {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProductRow
        title="You may also like"
        products={(related.data ?? []).filter((p) => p.id !== product.id)}
        loading={related.isLoading}
        viewAllTo={{ to: "/shop" }}
      />
    </ShopLayout>
  );
}
