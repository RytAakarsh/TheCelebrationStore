import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Truck, CreditCard, Banknote, MapPin, Plus, CheckCircle2, ArrowLeft, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCart, cartLinePrice } from "@/hooks/useCart";
import { placeOrder } from "@/lib/orders.functions";
import { inr, isValidIndianPhone, isValidPincode } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout — ${BRAND.name}` },
      { name: "description", content: "Complete your celebration supplies order securely." },
      { property: "og:title", content: `Checkout — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 79;

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submitOrder = useServerFn(placeOrder);

  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");

  // Saved addresses from DB
  const { data: savedAddresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");

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

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && selectedAddressId === "new") {
      const defaultAddr = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setForm({
          full_name: defaultAddr.full_name,
          phone: defaultAddr.phone,
          house: defaultAddr.house || "",
          street: defaultAddr.street || "",
          area: defaultAddr.area || "",
          landmark: defaultAddr.landmark || "",
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        });
      }
    }
  }, [savedAddresses]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Checkout" subtitle="Sign in to complete your celebration order" />
        <EmptyState
          title="Sign in to checkout"
          description="Login or create an account with Google to securely store your address and order tracking."
          action={
            <Button asChild className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold px-8 shadow-pink" size="lg">
              <Link to="/auth" search={{ next: "/checkout" }}>Sign In with Google / Email</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  if (user && items.length === 0) {
    return (
      <ShopLayout>
        <PageHeader title="Checkout" subtitle="Make every moment special" />
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart before proceeding to checkout."
          action={
            <Button asChild variant="gold" className="rounded-full font-bold px-8 shadow-gold" size="lg">
              <Link to="/shop">Shop Celebration Supplies</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_CHARGE;
  const grandTotal = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!isValidIndianPhone(form.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("Please provide your city and state.");
      return;
    }
    if (!isValidPincode(form.pincode)) {
      toast.error("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setBusy(true);
    try {
      // If user chose to enter a new address, save it for convenience
      if (selectedAddressId === "new" && user) {
        try {
          await supabase.from("addresses").insert({
            user_id: user.id,
            full_name: form.full_name.trim(),
            phone: form.phone.trim(),
            house: form.house.trim() || null,
            street: form.street.trim() || null,
            area: form.area.trim() || null,
            landmark: form.landmark.trim() || null,
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            is_default: (savedAddresses?.length ?? 0) === 0,
          });
        } catch (saveErr) {
          console.warn("Could not auto-save address to addresses table:", saveErr);
        }
      }

      const result = await submitOrder({
        data: {
          address: {
            full_name: form.full_name.trim(),
            phone: form.phone.trim(),
            house: form.house.trim(),
            street: form.street.trim(),
            area: form.area.trim(),
            landmark: form.landmark.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
          paymentMethod,
          couponCode: couponCode.trim() || null,
          notes: notes.trim() || null,
        },
      });

      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });

      toast.success(`Celebration Order #${result.orderNumber} placed successfully! 🎉`);
      navigate({ to: "/account/orders" });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ShopLayout>
      <PageHeader
        title="Secure Checkout"
        subtitle="Provide delivery address &amp; choose payment"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />

      <form onSubmit={submit} className="container-page grid gap-8 py-8 lg:grid-cols-12">
        {/* Left Column: Delivery Address & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Address Box */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                <span>1. Delivery Address</span>
              </h2>
            </div>

            {/* Saved addresses selector */}
            {savedAddresses && savedAddresses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-semibold">Select from Saved Addresses:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setForm({
                          full_name: addr.full_name,
                          phone: addr.phone,
                          house: addr.house || "",
                          street: addr.street || "",
                          area: addr.area || "",
                          landmark: addr.landmark || "",
                          city: addr.city,
                          state: addr.state,
                          pincode: addr.pincode,
                        });
                      }}
                      className={`cursor-pointer rounded-2xl border-2 p-3.5 text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-border bg-secondary/30 hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-ink">
                        <span>{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">Phone: {addr.phone}</p>
                      <p className="text-muted-foreground line-clamp-2">
                        {[addr.house, addr.street, addr.area, addr.city, addr.pincode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ))}

                  <div
                    onClick={() => {
                      setSelectedAddressId("new");
                      setForm({
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
                    }}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-3.5 text-xs flex items-center justify-center gap-2 transition-all ${
                      selectedAddressId === "new" ? "border-pink bg-pink/5 text-pink font-bold" : "border-border text-muted-foreground hover:border-pink"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Form Inputs */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <Label htmlFor="full_name" className="text-xs font-semibold text-ink">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  placeholder="e.g. Ramesh Varma"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-semibold text-ink">10-Digit Mobile Number *</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="house" className="text-xs font-semibold text-ink">Flat / House No. / Building</Label>
                <Input
                  id="house"
                  placeholder="e.g. Flat 302, Sai Residency"
                  value={form.house}
                  onChange={(e) => set("house", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="street" className="text-xs font-semibold text-ink">Street / Road Name</Label>
                <Input
                  id="street"
                  placeholder="e.g. Main Road, Poorna Market"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="area" className="text-xs font-semibold text-ink">Area / Locality</Label>
                <Input
                  id="area"
                  placeholder="e.g. Jagadamba Junction"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="landmark" className="text-xs font-semibold text-ink">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="e.g. Near Supermarket"
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-xs font-semibold text-ink">City *</Label>
                <Input
                  id="city"
                  required
                  placeholder="e.g. Visakhapatnam"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-xs font-semibold text-ink">State *</Label>
                <Input
                  id="state"
                  required
                  placeholder="e.g. Andhra Pradesh"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="pincode" className="text-xs font-semibold text-ink">6-Digit PIN Code *</Label>
                <Input
                  id="pincode"
                  required
                  maxLength={6}
                  placeholder="e.g. 530001"
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs font-semibold text-ink">Event Date / Special Instructions</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Event on Oct 15th, please pack carefully"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl mt-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Box */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <Banknote className="h-5 w-5 text-gold" />
              <span>2. Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${
                  paymentMethod === "cod" ? "border-gold bg-gold/10" : "border-border bg-card hover:border-gold/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  id="pay-cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-gold"
                />
                <div>
                  <Label htmlFor="pay-cod" className="cursor-pointer font-bold text-ink text-sm">
                    Cash on Delivery (COD)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Pay in cash or UPI when your parcel arrives.</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("online")}
                className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${
                  paymentMethod === "online" ? "border-pink bg-pink/10" : "border-border bg-card hover:border-pink/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  id="pay-online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="mt-1 accent-pink"
                />
                <div>
                  <Label htmlFor="pay-online" className="cursor-pointer font-bold text-ink text-sm flex items-center gap-1.5">
                    <span>UPI / Cards / Net Banking</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Secure payment via Razorpay / UPI QR.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <aside className="lg:col-span-5 h-fit rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 lg:sticky lg:top-28">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Order Review</h2>
            <p className="text-xs text-muted-foreground">{items.length} items in your celebration package</p>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-border pr-1 no-scrollbar space-y-2">
            {items.map((row) => (
              <div key={row.id} className="pt-2 flex justify-between items-center text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-ink truncate">{row.products?.name}</p>
                  <p className="text-muted-foreground">
                    {row.product_variants?.name ? `(${row.product_variants.name}) ` : ""}
                    Qty: {row.quantity} × {inr(cartLinePrice(row))}
                  </p>
                </div>
                <span className="font-bold text-ink shrink-0">{inr(cartLinePrice(row) * row.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <dl className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-ink">{inr(subtotal)}</dd>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping Fee</dt>
              <dd className="font-semibold text-ink">
                {isFreeShipping ? <span className="text-emerald-600 font-bold">FREE</span> : inr(shipping)}
              </dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 font-display text-xl font-bold text-ink">
              <dt>Total Payable</dt>
              <dd className="text-pink">{inr(grandTotal)}</dd>
            </div>
          </dl>

          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-pink text-white hover:bg-pink/90 font-bold shadow-pink text-sm h-12"
            size="lg"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Processing Order...</span>
              </span>
            ) : (
              <span>Place Celebration Order • {inr(grandTotal)}</span>
            )}
          </Button>

          <div className="text-center">
            <Link to="/cart" className="text-xs font-semibold text-muted-foreground hover:text-gold transition">
              ← Edit Cart Items
            </Link>
          </div>

          <div className="rounded-2xl bg-secondary/50 p-4 space-y-2 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Safe &amp; Authenticated Celebration Checkout</span>
            </p>
            <p>Every price, discount and minimum order quantity is verified server-side.</p>
          </div>
        </aside>
      </form>
    </ShopLayout>
  );
}
