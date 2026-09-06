import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { placeOrder } from "@/lib/orders.functions";
import { inr, isValidIndianPhone, isValidPincode } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vizag Party World" },
      { name: "description", content: "Complete your party supplies order securely." },
      { property: "og:title", content: "Checkout — Vizag Party World" },
      { property: "og:description", content: "Complete your celebration order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submitOrder = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    house: "",
    street: "",
    area: "",
    landmark: "",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "",
  });
  const [notes, setNotes] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Checkout" />
        <EmptyState
          title="Sign in to checkout"
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/checkout" }}>Sign in</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  if (user && items.length === 0) {
    return (
      <ShopLayout>
        <PageHeader title="Checkout" />
        <EmptyState
          title="Your cart is empty"
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/shop">Shop now</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianPhone(form.phone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!isValidPincode(form.pincode)) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitOrder({
        data: { address: form, paymentMethod: "cod", couponCode: null, notes: notes || null },
      });
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Order ${result.orderNumber} placed!`);
      navigate({ to: "/account/orders" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ShopLayout>
      <PageHeader title="Checkout" subtitle="Delivery details and payment" />
      <form onSubmit={submit} className="container-page grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-bold">Delivery address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" required inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="house">House / Flat</Label>
              <Input id="house" value={form.house} onChange={(e) => set("house", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="street">Street</Label>
              <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="landmark">Landmark</Label>
              <Input id="landmark" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" required value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" required inputMode="numeric" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
            </div>
          </div>

          <h2 className="pt-2 font-display text-lg font-bold">Payment</h2>
          <p className="rounded-xl bg-secondary p-3 text-sm">
            Cash on Delivery. Online payment will be enabled soon.
          </p>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-32">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((row) => (
              <li key={row.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate text-muted-foreground">
                  {row.products?.name} × {row.quantity}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>Subtotal</span>
            <span>{inr(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shipping is confirmed on the order summary.</p>
          <Button type="submit" variant="hero" size="lg" className="mt-4 w-full" disabled={busy}>
            {busy ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </form>
    </ShopLayout>
  );
}
