import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { inr, formatDateIST } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/brand";

export const Route = createFileRoute("/admin/orders/")({
  component: OrdersList,
});

function OrdersList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id,order_number,customer_name,phone,total,status,payment_status,payment_method,created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  if (isLoading || !data) return <AdminLoading />;

  const term = q.trim().toLowerCase();
  const rows = data.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (!term ||
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.phone.includes(term)),
  );

  return (
    <AdminPage title="Orders" description={`${data.length} orders placed`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order, name or phone"
        />
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant={status === "all" ? "hero" : "outline"} onClick={() => setStatus("all")}>
            All
          </Button>
          {ORDER_STATUSES.map((s) => (
            <Button key={s} size="sm" variant={status === s ? "hero" : "outline"} onClick={() => setStatus(s)}>
              {ORDER_STATUS_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-2 font-medium">{o.order_number}</td>
                <td className="px-4 py-2">
                  {o.customer_name}
                  <span className="block text-xs text-muted-foreground">{o.phone}</span>
                </td>
                <td className="px-4 py-2">{inr(o.total)}</td>
                <td className="px-4 py-2">
                  <Badge variant="outline">
                    {o.payment_method.toUpperCase()} · {o.payment_status}
                  </Badge>
                </td>
                <td className="px-4 py-2">{ORDER_STATUS_LABEL[o.status] ?? o.status}</td>
                <td className="px-4 py-2 text-muted-foreground">{formatDateIST(o.created_at)}</td>
                <td className="px-4 py-2 text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/admin/orders/$id" params={{ id: o.id }}>
                      Open
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
