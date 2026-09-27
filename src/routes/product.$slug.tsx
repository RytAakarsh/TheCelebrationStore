import { useMemo, useState } from "react";
import { SafeImage } from "@/components/shop/SafeImage";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Minus, MessageCircle, Plus, ShieldCheck, Truck, Sparkles, Check, Share2, HelpCircle, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopLayout, EmptyState } from "@/components/shop/ShopLayout";
import { ProductRow } from "@/components/shop/ProductRow";
import { StarRating } from "@/components/shop/StarRating";
import { productQuery, productsQuery, reviewsQuery, type Variant } from "@/lib/queries";
import { discountPercent, inr } from "@/lib/format";
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
        { title: `${pretty} — ${BRAND.name}` },
        { name: "description", content: `Buy ${pretty} online from ${BRAND.name}, Visakhapatnam. Make Every Moment Special.` },
        { property: "og:title", content: `${pretty} — ${BRAND.name}` },
        { property: "og:description", content: `Shop ${pretty} for birthdays, weddings and celebrations.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: reviews } = useQuery(reviewsQuery(product?.id));
  const related = useQuery(productsQuery({ categorySlug: product?.categories?.slug ?? undefined, limit: 8 }));
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
  const sku = variant?.sku ?? product?.sku ?? "";
  const [qty, setQty] = useState(1);
  const quantity = Math.max(qty, moq);

  const images = useMemo(() => {
    const variantImgs = (variant?.variant_images ?? []).map((v) => v.url);
    const base = [...(product?.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
      .map((i) => i.url);
    const combined = [...variantImgs, ...base];
    return combined.length > 0 ? combined : ["/assets/placeholder.svg"];
  }, [product, variant]);

  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="container-page grid gap-8 py-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-secondary" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-xl bg-secondary" />
            <div className="h-6 w-1/3 animate-pulse rounded-xl bg-secondary" />
            <div className="h-28 w-full animate-pulse rounded-xl bg-secondary" />
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
          description="This celebration item may have been discontinued or is temporarily unpublished."
          action={
            <Button asChild variant="gold" className="rounded-full">
              <Link to="/shop">Explore Celebration Store</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  const off = discountPercent(mrp, price);
  const saved = ids.has(product.id);
  const outOfStock = stock <= 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} — ${BRAND.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please sign in to proceed with checkout.");
      navigate({ to: "/auth" });
      return;
    }
    await add.mutateAsync({ productId: product.id, variantId, quantity });
    navigate({ to: "/checkout" });
  };

  return (
    <ShopLayout>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container-page pt-4 pb-2 text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link to="/category/$slug" params={{ slug: product.categories.slug }} className="hover:text-gold transition-colors">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Presentation */}
      <div className="container-page grid gap-8 py-6 lg:grid-cols-12">
        {/* Gallery Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {off > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-pink px-3 py-1 text-xs font-bold text-white shadow-sm">
                {off}% OFF
              </span>
            )}
            <button
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to save favourites.");
                  return;
                }
                toggle.mutate(product.id);
              }}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-md backdrop-blur transition hover:bg-card"
            >
              <Heart className={cn("h-5 w-5", saved ? "fill-pink text-pink" : "text-muted-foreground")} />
            </button>

            <div className="aspect-square w-full grid place-items-center p-6 bg-[#FAF9F6]">
              {images[active] ? (
                <SafeImage
                  src={images[active]}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="grid aspect-square place-items-center text-sm text-muted-foreground">No image</div>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-card p-1.5 transition-all",
                    i === active ? "border-gold shadow-gold" : "border-border opacity-70 hover:opacity-100",
                  )}
                >
                  <SafeImage src={url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions Column (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            {product.categories && (
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                {product.categories.name}
              </span>
            )}
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
              {product.name}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {product.review_count > 0 && <StarRating value={Number(product.rating)} count={product.review_count} />}
              {product.sold_count > 0 && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-foreground">
                  🔥 {product.sold_count} ordered
                </span>
              )}
              {sku && <span>SKU: <strong className="text-foreground">{sku}</strong></span>}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl border border-border bg-[#FFFDF9] p-4.5 space-y-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl sm:text-4xl font-bold text-ink">{inr(price)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{inr(mrp)}</span>
                  <span className="rounded-full bg-pink/15 px-2.5 py-0.5 text-xs font-bold text-pink">
                    Save {off}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Inclusive of all taxes • Flat ₹79 shipping across India • Free shipping over ₹999
            </p>
          </div>

          {product.short_description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Variants Selector */}
          {variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-ink">Select Color / Option:</span>
                {variant && <span className="text-pink font-semibold">{variant.name}</span>}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variants.map((v) => {
                  const isSelected = v.id === (variantId ?? variants[0]?.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setVariantId(v.id);
                        setActive(0);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-xs font-semibold transition-all",
                        isSelected
                          ? "border-gold bg-gold/10 text-ink shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-gold/50",
                        v.stock <= 0 && "opacity-50",
                      )}
                    >
                      {v.color_hex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: v.color_hex }}
                        />
                      )}
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Inventory Status */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center rounded-2xl border-2 border-border bg-card">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(moq, quantity - 1))}
                className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-ink"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-ink">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(quantity + 1)}
                className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-ink"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs space-y-0.5">
              {moq > 1 && (
                <p className="font-bold text-orange">
                  ⚠️ Minimum Order Quantity: {moq} pieces
                </p>
              )}
              <p className={cn("font-semibold", outOfStock ? "text-destructive" : stock <= 5 ? "text-orange" : "text-emerald-600")}>
                {outOfStock ? "Out of Stock" : stock <= 5 ? `Only ${stock} left in stock - order soon` : "✓ In Stock, Ready to Dispatch"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              disabled={outOfStock || add.isPending}
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to add items to your cart.");
                  return;
                }
                add.mutate({ productId: product.id, variantId, quantity });
              }}
              variant="coral"
              className="rounded-2xl text-sm h-12"
            >
              Add to Celebration Cart
            </Button>

            <Button
              size="lg"
              variant="gold"
              disabled={outOfStock || add.isPending}
              onClick={handleBuyNow}
              className="rounded-2xl font-bold shadow-gold text-sm h-12"
            >
              Buy Now
            </Button>
          </div>

          {/* Secondary Actions: WhatsApp & Share */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild size="lg" variant="outline" className="rounded-2xl border-emerald-500/40 text-emerald-700 hover:bg-emerald-50">
              <a href={productWhatsappLink(product.name)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp Enquiry</span>
              </a>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={handleShare}
              className="rounded-2xl border border-border hover:bg-secondary"
            >
              <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Share Product</span>
            </Button>
          </div>

          {/* Key Assurance Badges */}
          <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold shrink-0" />
              <span>Flat ₹79 Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple shrink-0" />
              <span>Secure Bubble Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink shrink-0" />
              <span>Visakhapatnam Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specs, Shipping, Reviews */}
      <div className="container-page py-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-2xl bg-secondary p-1.5 h-auto">
            <TabsTrigger value="description" className="rounded-xl py-2.5 text-xs font-bold">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="rounded-xl py-2.5 text-xs font-bold">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-xl py-2.5 text-xs font-bold">
              Shipping &amp; Policy
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl py-2.5 text-xs font-bold">
              Reviews ({reviews?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
            <h3 className="font-display text-lg font-bold text-ink">Product Overview</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || product.short_description || "High-quality celebration essentials curated for your special moments."}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-ink mb-4">Product Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Product SKU:</span>
                <span className="font-semibold text-ink">{sku || "VPW-" + product.slug.toUpperCase().slice(0, 8)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold text-ink">{product.categories?.name ?? "Celebration Supplies"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Minimum Order:</span>
                <span className="font-semibold text-ink">{moq} pieces</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Inventory Status:</span>
                <span className="font-semibold text-emerald-600">{stock > 0 ? "Available" : "Out of Stock"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-semibold text-ink">{BRAND.name}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Store Location:</span>
                <span className="font-semibold text-ink">Poorna Market, Visakhapatnam</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 text-xs text-muted-foreground leading-relaxed">
            <h3 className="font-display text-lg font-bold text-ink">Shipping &amp; Delivery Information</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Flat Shipping Rate:</strong> Standard shipping at flat ₹79 across India.</li>
              <li><strong>Free Shipping:</strong> Automatically applied for cart subtotals of ₹999 or more.</li>
              <li><strong>Delivery Timeline:</strong> Orders are processed within 24-48 hours. Standard transit takes 3–5 business days depending on location.</li>
              <li><strong>Store Pickup / Local Delivery:</strong> Available from our Poorna Market, Visakhapatnam store. Contact us on WhatsApp to arrange local pickup.</li>
              <li><strong>Damage / Transit Guarantee:</strong> In the rare event of transit damage, please notify us within 24 hours with an unboxing photo/video for immediate replacement.</li>
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Customer Reviews</h3>
                <p className="text-xs text-muted-foreground">Genuine feedback from verified purchasers</p>
              </div>
              {product.review_count > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-bold text-ink">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground"> / 5.0</span>
                </div>
              )}
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-border">
                {reviews.map((r) => (
                  <div key={r.id} className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <StarRating value={r.rating} count={0} />
                      <span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.title && <h4 className="text-xs font-bold text-ink">{r.title}</h4>}
                    {r.body && <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Sparkles className="mx-auto h-8 w-8 text-gold/60" />
                <p className="text-xs text-muted-foreground">No customer reviews yet for this product.</p>
                <p className="text-[11px] text-muted-foreground">Be the first verified buyer to leave a review after placing your order!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Carousel / Grid */}
      {related.data && related.data.length > 0 && (
        <div className="py-6">
          <ProductRow
            title="People Also Shop"
            subtitle="Recommended celebration essentials"
            products={related.data.filter((p) => p.id !== product.id)}
            loading={related.isLoading}
            viewAllTo={{ to: "/shop" }}
          />
        </div>
      )}

      {/* Sticky Mobile Add To Cart / Buy Now Bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-card/95 p-3 shadow-lift backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-muted-foreground">Total ({quantity} pcs)</span>
            <div className="font-display text-base font-bold text-ink">{inr(price * quantity)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={outOfStock || add.isPending}
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to add to cart.");
                  return;
                }
                add.mutate({ productId: product.id, variantId, quantity });
              }}
              variant="coral"
              className="rounded-xl text-xs px-3.5"
            >
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="gold"
              disabled={outOfStock || add.isPending}
              onClick={handleBuyNow}
              className="rounded-xl text-xs px-3"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
