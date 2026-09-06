import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useCart, cartLinePrice, cartLineMrp, cartLineMoq, cartLineStock } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Vizag Party World" },
      { name: "description", content: "Review your party supplies before checkout." },
      { property: "og:title", content: "Your Cart — Vizag Party World" },
      { property: "og:description", content: "Review your celebration order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, mrpTotal, setQuantity, remove, isLoading } = useCart();

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Your Cart" />
        <EmptyState
          title="Sign in to see your cart"
          description="Your cart is saved to your account so you can pick up where you left off."
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/cart" }}>Sign in</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <ShopLayout>
        <PageHeader title="Your Cart" />
        <EmptyState
          title="Your cart is empty"
          description="Add balloons, decorations or return gifts to get started."
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/shop">Start shopping</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  const savings = Math.max(0, mrpTotal - subtotal);

  return (
    <ShopLayout>
      <PageHeader title="Your Cart" subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`} />
      <div className="container-page grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="space-y-3">
          {items.map((row) => {
            const image = [...(row.products?.product_images ?? [])].sort(
              (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
            )[0]?.url;
            const moq = cartLineMoq(row);
            const stock = cartLineStock(row);
            return (
              <li key={row.id} className="card-product flex gap-3 p-3">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {image && <img src={image} alt={row.products?.name ?? ""} className="h-full w-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/product/$slug"
                    params={{ slug: row.products?.slug ?? "" }}
                    className="line-clamp-2 text-sm font-semibold hover:text-pink"
                  >
                    {row.products?.name}
                  </Link>
                  {row.product_variants && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.product_variants.name}</p>
                  )}
                  <p className="mt-1 text-sm font-bold">{inr(cartLinePrice(row))}</p>
                  {row.quantity > stock && (
                    <p className="text-xs font-semibold text-destructive">Only {stock} in stock</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="grid h-9 w-9 place-items-center"
                        onClick={() => setQuantity.mutate({ id: row.id, quantity: Math.max(moq, row.quantity - 1) })}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{row.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="grid h-9 w-9 place-items-center"
                        onClick={() => setQuantity.mutate({ id: row.id, quantity: row.quantity + 1 })}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove.mutate(row.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm font-bold">{inr(cartLinePrice(row) * row.quantity)}</div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-32">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Item total</dt>
              <dd>{inr(mrpTotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-{inr(savings)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Subtotal</dt>
              <dd>{inr(subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-1 text-xs text-muted-foreground">Shipping calculated at checkout.</p>
          <Button asChild variant="hero" size="lg" className="mt-4 w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </ShopLayout>
  );
}
