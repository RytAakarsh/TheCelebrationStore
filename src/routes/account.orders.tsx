import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDateIST, inr } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/brand";

export const Route = createFileRoute("/account/orders")({
  component: MyOrders,
});

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

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-secondary" />;

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="font-display text-lg font-bold">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your celebration orders will appear here.</p>
        <Button asChild variant="hero" className="mt-4">
          <Link to="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((order) => (
        <li key={order.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold">#{order.order_number}</p>
              <p className="text-xs text-muted-foreground">{formatDateIST(order.created_at)}</p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold">
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {(order.order_items ?? []).map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant_name ? `${item.variant_name} · ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{inr(Number(item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-bold">
            <span>Total</span>
            <span>{inr(order.total)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
