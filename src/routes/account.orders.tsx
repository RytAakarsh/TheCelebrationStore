import { createFileRoute, Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/shop/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDateIST, inr } from "@/lib/format";
import { ORDER_STATUS_LABEL, TRACK_STEPS, BRAND, whatsappLink } from "@/lib/brand";
import { Package, Truck, CheckCircle2, Clock, MessageCircle, AlertCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  component: MyOrders,
});

function getStepIndex(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "pending") return 0;
  if (normalized === "confirmed") return 1;
  if (normalized === "processing") return 2;
  if (normalized === "packed") return 3;
  if (normalized === "shipped") return 4;
  if (normalized === "out_for_delivery") return 5;
  if (normalized === "delivered") return 6;
  return -1;
}

function MyOrders() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(id,product_name,variant_name,quantity,price,image_url)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-3xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center space-y-4 shadow-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">No Celebration Orders Yet</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          When you place orders for balloons, return gifts or decorations, track them right here in real time.
        </p>
        <div className="pt-2">
          <Button asChild className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold shadow-pink px-8" size="lg">
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Your Celebration Orders</h2>
          <p className="text-xs text-muted-foreground">Track delivery status &amp; review receipts</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-ink">
          {data.length} Order{data.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="space-y-5">
        {data.map((order) => {
          const currentStep = getStepIndex(order.status);
          const isCancelled = order.status === "cancelled";
          const isDelivered = order.status === "delivered";
          const addr = order.address as any;

          return (
            <li key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base sm:text-lg font-bold text-ink">
                      Order #{order.order_number}
                    </span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      isCancelled
                        ? "bg-destructive/15 text-destructive"
                        : isDelivered
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gold/20 text-gold-foreground font-semibold"
                    }`}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Placed on {formatDateIST(order.created_at)} • Payment: {order.payment_method?.toUpperCase()} ({order.payment_status})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50">
                    <a
                      href={whatsappLink(`Hello ${BRAND.name}, I would like an update on Order #${order.order_number}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp Support</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Visual Order Progress Tracker */}
              {!isCancelled && (
                <div className="rounded-2xl bg-[#FFFDF9] border border-border/80 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-gold" />
                    <span>Live Tracking Status</span>
                  </p>

                  <div className="relative pt-2 pb-1">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center">
                      {TRACK_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5">
                            <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors ${
                              isDone
                                ? "bg-pink text-white shadow-sm"
                                : isCurrent
                                ? "border-2 border-pink bg-pink/20 text-pink animate-pulse"
                                : "bg-secondary text-muted-foreground"
                            }`}>
                              {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1 ${
                              isCurrent ? "text-pink font-bold" : isDone ? "text-ink" : "text-muted-foreground"
                            }`}>
                              {ORDER_STATUS_LABEL[step] ?? step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items List */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items in Package</p>
                <ul className="divide-y divide-border rounded-2xl bg-secondary/30 p-3 space-y-2">
                  {(order.order_items ?? []).map((item) => (
                    <li key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card border border-border p-1">
                          {item.image_url ? (
                            <SafeImage src={item.image_url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <div className="grid h-full place-items-center text-[10px] text-muted-foreground">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-ink truncate">{item.product_name}</p>
                          <p className="text-muted-foreground">
                            {item.variant_name ? `Option: ${item.variant_name} • ` : ""}
                            Qty: {item.quantity} × {inr(Number(item.price))}
                          </p>
                        </div>
                      </div>
                      <span className="font-display font-bold text-ink shrink-0">{inr(Number(item.price) * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Details & Summary Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                <div>
                  <strong className="block text-ink font-semibold mb-1">Delivery Destination:</strong>
                  {addr ? (
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-ink">{addr.full_name}</strong> ({addr.phone})<br />
                      {[addr.house, addr.street, addr.area, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Customer: {order.customer_name} ({order.phone})</p>
                  )}
                  {order.notes && (
                    <p className="mt-2 text-pink font-medium">Note: {order.notes}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:text-right">
                  <div className="flex justify-between sm:justify-end gap-4 text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-medium text-ink">{inr(order.subtotal)}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between sm:justify-end gap-4 text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-{inr(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between sm:justify-end gap-4 text-muted-foreground">
                    <span>Shipping:</span>
                    <span className="font-medium text-ink">{Number(order.shipping) === 0 ? "FREE" : inr(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-4 border-t border-border pt-2 font-display text-base font-bold text-ink">
                    <span>Order Total:</span>
                    <span className="text-pink">{inr(order.total)}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
