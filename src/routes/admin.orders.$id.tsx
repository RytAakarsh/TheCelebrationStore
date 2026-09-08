import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { SafeImage } from "@/components/shop/SafeImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { inr, formatDateIST } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/brand";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetail,
});

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

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
      qc.invalidateQueries();
      toast.success("Order updated");
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

  return (
    <AdminPage
      title={`Order ${o.order_number}`}
      description={formatDateIST(o.created_at)}
      actions={
        <Button asChild variant="outline">
          <Link to="/admin/orders">Back to orders</Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Items</h2>
          <ul className="mt-3 divide-y divide-border">
            {data.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <SafeImage src={it.image_url} alt="" className="h-full w-full object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.variant_name ? `${it.variant_name} · ` : ""}Qty {it.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{inr(it.total)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{inr(o.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{inr(o.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{inr(o.discount)}</dd>
            </div>
            <div className="flex justify-between font-display text-base font-bold">
              <dt>Total</dt>
              <dd>{inr(o.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-lg font-bold">Customer</h2>
            <p className="mt-2 text-sm font-medium">{o.customer_name}</p>
            <p className="text-sm text-muted-foreground">{o.phone}</p>
            {o.email && <p className="text-sm text-muted-foreground">{o.email}</p>}
            <p className="mt-3 text-sm text-muted-foreground">
              {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
            </p>
            {o.notes && <p className="mt-3 text-sm italic text-muted-foreground">“{o.notes}”</p>}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-lg font-bold">Payment</h2>
            <Badge variant="outline" className="mt-2">
              {o.payment_method.toUpperCase()} · {o.payment_status}
            </Badge>
            <div className="mt-3 flex flex-wrap gap-2">
              {["pending", "paid", "failed", "refunded"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.payment_status === s ? "hero" : "outline"}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ payment_status: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-lg font-bold">Order status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.status === s ? "hero" : "outline"}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ status: s })}
                >
                  {ORDER_STATUS_LABEL[s]}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminPage>
  );
}
