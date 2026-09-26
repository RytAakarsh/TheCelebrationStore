import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Printer,
  Phone,
  MessageSquare,
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  User,
  Package,
} from "lucide-react";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { SafeImage } from "@/components/shop/SafeImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { inr, formatDateIST } from "@/lib/format";
import { BRAND, ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/brand";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetail,
});

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  full_name?: string;
  phone?: string;
};

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [printing, setPrinting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () => {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id),
      ]);
      if (orderRes.error) throw new Error(orderRes.error.message);
      if (itemsRes.error) throw new Error(itemsRes.error.message);
      return { order: orderRes.data, items: itemsRes.data ?? [] };
    },
  });

  const update = useMutation({
    mutationFn: async (patch: { status?: string; payment_status?: string }) => {
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update order"),
  });

  if (isLoading) return <AdminLoading />;
  if (!data?.order) {
    return (
      <AdminPage title="Order not found">
        <Button asChild variant="outline">
          <Link to="/admin/orders">Back to orders</Link>
        </Button>
      </AdminPage>
    );
  }

  const o = data.order;
  const addr = (o.address ?? {}) as Address;

  const handlePrint = () => {
    window.print();
  };

  const whatsappCustomer = () => {
    const rawPhone = (o.phone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = encodeURIComponent(
      `Hello ${o.customer_name}! Greetings from ${BRAND.name} (Poorna Market, Vizag).\n\nRegarding your Order #${o.order_number}:\nStatus: ${ORDER_STATUS_LABEL[o.status] || o.status}\nTotal: ₹${o.total}\nPayment: ${o.payment_method.toUpperCase()} (${o.payment_status})\n\nThank you for choosing ${BRAND.name}! Let us know if you have any questions.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <AdminPage
      title={`Order #${o.order_number}`}
      description={`Placed on ${formatDateIST(o.created_at)}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
        </div>
      }
    >
      {/* Printable Invoice Header (Hidden on screen, visible in print) */}
      <div className="hidden print:block print:mb-6 print:border-b print:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">{BRAND.name}</h1>
            <p className="text-xs text-gray-600">{BRAND.tagline}</p>
            <p className="text-xs text-gray-600">{BRAND.address}</p>
            <p className="text-xs text-gray-600">Phone / WhatsApp: +91 {BRAND.phone} | Email: {BRAND.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">TAX INVOICE</h2>
            <p className="text-xs font-semibold">Invoice / Order #: {o.order_number}</p>
            <p className="text-xs text-gray-600">Date: {formatDateIST(o.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Order items and financial breakdown */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gold" />
                <h2 className="font-display text-lg font-bold">Ordered Items ({data.items.length})</h2>
              </div>
              <Badge variant="outline" className="capitalize">
                {ORDER_STATUS_LABEL[o.status] || o.status}
              </Badge>
            </div>

            <div className="mt-4 divide-y divide-border">
              {data.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                    <SafeImage src={it.image_url} alt={it.product_name} className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm">{it.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.variant_name ? `Variant: ${it.variant_name} · ` : ""}
                      Unit Price: {inr(it.unit_price)} × {it.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-sm">{inr(it.total)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-4 border-t border-border pt-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{inr(o.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping Fee</dt>
                  <dd className="font-medium">{o.shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : inr(o.shipping)}</dd>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Coupon Discount</dt>
                    <dd className="font-medium">-{inr(o.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold text-gold">
                  <dt>Grand Total</dt>
                  <dd>{inr(o.total)}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Customer & Delivery Details */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg font-bold">Shipping & Delivery Destination</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-semibold">{addr.full_name || o.customer_name}</p>
                <p className="text-muted-foreground mt-1">
                  {[addr.line1, addr.line2, addr.landmark].filter(Boolean).join(", ")}
                </p>
                <p className="text-muted-foreground">
                  {[addr.city, addr.state, addr.pincode ? `PIN: ${addr.pincode}` : ""].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-gold" />
                  <span>{addr.phone || o.phone}</span>
                </div>
                {o.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-gold" />
                    <span>{o.email}</span>
                  </div>
                )}
                {o.notes && (
                  <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Customer Note:</span> “{o.notes}”
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right col: Actions, Status Changer, Payment */}
        <div className="space-y-6">
          {/* Quick Customer Action Buttons */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <h2 className="font-display text-base font-bold">Direct Customer Contact</h2>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                onClick={whatsappCustomer}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Customer
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <a href={`tel:${(o.phone || "").replace(/\D/g, "")}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Customer Phone
                </a>
              </Button>
            </div>
          </section>

          {/* Fulfilment Status */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gold" />
              <h2 className="font-display text-base font-bold">Fulfillment Status</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ORDER_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.status === s ? "hero" : "outline"}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ status: s })}
                  className="capitalize"
                >
                  {ORDER_STATUS_LABEL[s] || s}
                </Button>
              ))}
            </div>
          </section>

          {/* Payment Status */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              <h2 className="font-display text-base font-bold">Payment Details</h2>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-bold uppercase">{o.payment_method}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-bold capitalize">{o.payment_status}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["pending", "paid", "failed", "refunded"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.payment_status === s ? "hero" : "outline"}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ payment_status: s })}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminPage>
  );
}
