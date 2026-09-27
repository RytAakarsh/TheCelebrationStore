import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { Minus, Plus, Trash2, Tag, Truck, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useCart, cartLinePrice, cartLineMrp, cartLineMoq, cartLineStock } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { inr } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import { useServerFn } from "@tanstack/react-start";
import { validateCoupon } from "@/lib/orders.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: `Your Celebration Cart — ${BRAND.name}` },
      { name: "description", content: "Review your celebration supplies, return gifts and party essentials before checkout." },
      { property: "og:title", content: `Your Cart — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 79;

function CartPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, mrpTotal, setQuantity, remove, isLoading } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const checkCouponFn = useServerFn(validateCoupon);

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Your Celebration Cart" subtitle="Save items to your account and checkout securely" />
        <EmptyState
          title="Sign in to view your celebration cart"
          description="Your cart is automatically saved to your account across your phone and computer."
          action={
            <Button asChild className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold shadow-pink px-6" size="lg">
              <Link to="/auth" search={{ next: "/cart" }}>Sign in / Create Account</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <ShopLayout>
        <PageHeader title="Your Celebration Cart" subtitle="Make every moment special" />
        <EmptyState
          title="Your celebration cart is waiting! 🎉"
          description="Discover balloons, party decorations, German silver return gifts, and celebration essentials."
          action={
            <Button asChild variant="gold" className="rounded-full font-bold shadow-gold px-8" size="lg">
              <Link to="/shop">Explore Celebration Supplies</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  const savings = Math.max(0, mrpTotal - subtotal);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const effectiveSubtotal = Math.max(0, subtotal - couponDiscount);
  const isFreeShipping = effectiveSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_CHARGE;
  const grandTotal = effectiveSubtotal + shipping;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - effectiveSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((effectiveSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await checkCouponFn({ data: { code: couponInput.trim() } });
      if (res.valid) {
        setAppliedCoupon({ code: res.code, discount: res.discount });
        toast.success(`Coupon "${res.code}" applied! You saved ${inr(res.discount)}`);
      } else {
        toast.error((res as any).message || "Invalid coupon code");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not validate coupon");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed.");
  }

  return (
    <ShopLayout>
      <PageHeader
        title="Your Celebration Cart"
        subtitle={`${items.length} unique item${items.length === 1 ? "" : "s"} ready for your event`}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Cart" }]}
      />

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Cart Items List */}
        <div className="space-y-4">
          {/* Free Shipping Progress Indicator */}
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-amber-500/10 via-pink-500/5 to-amber-500/10 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-ink">
              <Truck className="h-4 w-4 text-gold shrink-0" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold">🎉 Congratulations! You qualify for FREE Shipping across India!</span>
              ) : (
                <span>
                  Add <strong className="text-pink">{inr(amountNeededForFreeShipping)}</strong> more to get <strong>FREE Delivery</strong>!
                </span>
              )}
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-gold to-pink transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <ul className="space-y-3">
            {items.map((row) => {
              const image = [...(row.products?.product_images ?? [])].sort(
                (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
              )[0]?.url;
              const moq = cartLineMoq(row);
              const stock = cartLineStock(row);
              const unitPrice = cartLinePrice(row);
              const itemTotal = unitPrice * row.quantity;

              return (
                <li key={row.id} className="card-product flex gap-4 p-4 items-start sm:items-center">
                  <div className="h-22 w-22 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FAF9F6] border border-border p-1.5 grid place-items-center">
                    {image ? (
                      <SafeImage src={image} alt={row.products?.name ?? ""} className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-xs text-muted-foreground">No image</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: row.products?.slug ?? "" }}
                      className="line-clamp-2 text-sm font-bold text-ink hover:text-pink transition-colors"
                    >
                      {row.products?.name}
                    </Link>

                    {row.product_variants && (
                      <p className="text-xs font-medium text-pink">
                        Option: {row.product_variants.name}
                      </p>
                    )}

                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="font-bold text-ink">{inr(unitPrice)}</span>
                      <span className="text-muted-foreground">× {row.quantity} pcs</span>
                    </div>

                    {moq > 1 && (
                      <p className="text-[11px] text-orange font-semibold">MOQ: {moq} pieces</p>
                    )}

                    {row.quantity > stock && (
                      <p className="text-xs font-semibold text-destructive">Only {stock} left in stock</p>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center rounded-xl border border-border bg-card">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-ink disabled:opacity-40"
                          disabled={row.quantity <= moq}
                          onClick={() => setQuantity.mutate({ id: row.id, quantity: Math.max(moq, row.quantity - 1) })}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-ink">{row.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-ink"
                          onClick={() => setQuantity.mutate({ id: row.id, quantity: row.quantity + 1 })}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove.mutate(row.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-display text-base font-bold text-ink">{inr(itemTotal)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 lg:sticky lg:top-28">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Order Summary</h2>
            <p className="text-xs text-muted-foreground">Price breakdown &amp; discounts</p>
          </div>

          {/* Coupon Code Section */}
          <div className="rounded-2xl border border-border bg-secondary/50 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <Tag className="h-3.5 w-3.5 text-gold" />
              <span>Apply Coupon Code</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                <div>
                  <span className="font-bold">{appliedCoupon.code}</span>
                  <span className="block text-[11px] text-emerald-600">You saved {inr(appliedCoupon.discount)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. CELEBRATE10"
                  className="rounded-xl text-xs uppercase bg-card"
                />
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="rounded-xl font-bold shrink-0"
                >
                  {checkingCoupon ? "..." : "Apply"}
                </Button>
              </form>
            )}
          </div>

          {/* Price Breakdown */}
          <dl className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <dt>Items MRP Total</dt>
              <dd className="font-medium text-ink">{inr(mrpTotal)}</dd>
            </div>

            {savings > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <dt>Product Discount</dt>
                <dd>-{inr(savings)}</dd>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <dt>Coupon Discount ({appliedCoupon.code})</dt>
                <dd>-{inr(appliedCoupon.discount)}</dd>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <dt>Estimated Delivery</dt>
              <dd className="font-medium text-ink">
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span>{inr(SHIPPING_CHARGE)}</span>
                )}
              </dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 font-display text-lg sm:text-xl font-bold text-ink">
              <dt>Grand Total</dt>
              <dd className="text-pink">{inr(grandTotal)}</dd>
            </div>
          </dl>

          <Button
            onClick={() => navigate({ to: "/checkout" })}
            variant="gold"
            className="w-full rounded-2xl text-sm h-12"
            size="lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center">
            <Link to="/shop" className="text-xs font-semibold text-muted-foreground hover:text-gold transition">
              ← Continue Shopping
            </Link>
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% Safe &amp; Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold shrink-0" />
              <span>Genuine Celebration Quality Guaranteed</span>
            </div>
          </div>
        </aside>
      </div>
    </ShopLayout>
  );
}
