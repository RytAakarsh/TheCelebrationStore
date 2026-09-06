import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { SafeImage } from "@/components/shop/SafeImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { inr, formatDateIST } from "@/lib/format";
import { istDayStart, istDayKey, istDayLabel } from "@/lib/admin/ist";
import { ORDER_STATUS_LABEL } from "@/lib/brand";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
};

function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [ordersRes, productsRes, customersRes, categoriesRes, itemsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id,order_number,customer_name,total,status,payment_status,payment_method,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,stock,low_stock_threshold,is_published,is_archived,is_featured,category_id,sold_count,product_images(url,is_primary,position)"),
        supabase.from("profiles").select("id"),
        supabase.from("categories").select("id,name"),
        supabase.from("order_items").select("product_id,product_name,image_url,quantity,total,orders!inner(status,created_at)"),
      ]);

      if (ordersRes.error) throw new Error(ordersRes.error.message);
      if (productsRes.error) throw new Error(productsRes.error.message);

      const orders = (ordersRes.data ?? []) as OrderRow[];
      const products = productsRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const items = (itemsRes.data ?? []) as unknown as {
        product_id: string | null;
        product_name: string;
        image_url: string | null;
        quantity: number;
        total: number;
        orders: { status: string; created_at: string };
      }[];

      const notCancelled = (s: string) => s !== "cancelled" && s !== "refunded";
      const todayStart = istDayStart().getTime();
      const weekStart = istDayStart(6).getTime();
      const monthStart = istDayStart(29).getTime();
      const at = (o: OrderRow) => new Date(o.created_at).getTime();

      const todays = orders.filter((o) => at(o) >= todayStart);
      const revenue = (rows: OrderRow[]) =>
        rows.filter((o) => notCancelled(o.status)).reduce((s, o) => s + Number(o.total), 0);

      // sales chart: last 30 IST days
      const buckets = new Map<string, number>();
      for (let i = 29; i >= 0; i--) buckets.set(istDayKey(istDayStart(i)), 0);
      for (const o of orders) {
        if (!notCancelled(o.status)) continue;
        const key = istDayKey(o.created_at);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(o.total));
      }

      const soldByProduct = new Map<string, { name: string; image: string | null; units: number; revenue: number }>();
      for (const it of items) {
        if (!notCancelled(it.orders?.status ?? "pending")) continue;
        const key = it.product_id ?? it.product_name;
        const prev = soldByProduct.get(key) ?? { name: it.product_name, image: it.image_url, units: 0, revenue: 0 };
        prev.units += it.quantity;
        prev.revenue += Number(it.total);
        soldByProduct.set(key, prev);
      }

      const productCategory = new Map(products.map((p) => [p.id, p.category_id]));
      const categoryName = new Map(categories.map((c) => [c.id, c.name]));
      const byCategory = new Map<string, { name: string; units: number; revenue: number; orders: number }>();
      for (const it of items) {
        if (!notCancelled(it.orders?.status ?? "pending")) continue;
        const catId = it.product_id ? productCategory.get(it.product_id) : null;
        const name = (catId && categoryName.get(catId)) || "Uncategorised";
        const prev = byCategory.get(name) ?? { name, units: 0, revenue: 0, orders: 0 };
        prev.units += it.quantity;
        prev.revenue += Number(it.total);
        prev.orders += 1;
        byCategory.set(name, prev);
      }

      const { count: offerCount } = await supabase
        .from("offer_products")
        .select("id", { count: "exact", head: true });

      return {
        products: {
          total: products.length,
          active: products.filter((p) => p.is_published && !p.is_archived).length,
          outOfStock: products.filter((p) => p.stock <= 0).length,
          lowStock: products.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5)).length,
          featured: products.filter((p) => p.is_featured).length,
        },
        offerProducts: offerCount ?? 0,
        orders: {
          total: orders.length,
          today: todays.length,
          pending: orders.filter((o) => o.status === "pending").length,
          processing: orders.filter((o) => o.status === "processing").length,
          todayRevenue: revenue(todays),
          todayPending: todays.filter((o) => o.status === "pending").length,
          todayDelivered: todays.filter((o) => o.status === "delivered").length,
          todayCancelled: todays.filter((o) => o.status === "cancelled").length,
        },
        sales: {
          today: revenue(todays),
          week: revenue(orders.filter((o) => at(o) >= weekStart)),
          month: revenue(orders.filter((o) => at(o) >= monthStart)),
        },
        customers: (customersRes.data ?? []).length,
        categories: categories.length,
        recent: orders.slice(0, 8),
        chart: [...buckets.entries()].map(([key, value]) => ({ day: istDayLabel(key), value })),
        topProducts: [...soldByProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5),
        topCategories: [...byCategory.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      };
    },
  });
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading } = useDashboard();
  const [range, setRange] = useState<7 | 14 | 30>(30);

  if (isLoading || !data) return <AdminLoading />;
  const chart = data.chart.slice(-range);

  return (
    <AdminPage title="Dashboard" description="Live figures from your store database (IST)">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total products" value={String(data.products.total)} />
        <Stat label="Active products" value={String(data.products.active)} />
        <Stat label="Out of stock" value={String(data.products.outOfStock)} tone="text-destructive" />
        <Stat label="Low stock" value={String(data.products.lowStock)} tone="text-gold" />
        <Stat label="Total orders" value={String(data.orders.total)} />
        <Stat label="Today's orders" value={String(data.orders.today)} />
        <Stat label="Pending orders" value={String(data.orders.pending)} />
        <Stat label="Processing" value={String(data.orders.processing)} />
        <Stat label="Today's sales" value={inr(data.sales.today)} />
        <Stat label="Last 7 days" value={inr(data.sales.week)} />
        <Stat label="Last 30 days" value={inr(data.sales.month)} />
        <Stat label="Customers" value={String(data.customers)} />
        <Stat label="Categories" value={String(data.categories)} />
        <Stat label="Featured products" value={String(data.products.featured)} />
        <Stat label="Offer products" value={String(data.offerProducts)} />
        <Stat label="Today's revenue" value={inr(data.orders.todayRevenue)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Today pending" value={String(data.orders.todayPending)} />
        <Stat label="Today delivered" value={String(data.orders.todayDelivered)} />
        <Stat label="Today cancelled" value={String(data.orders.todayCancelled)} />
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold">Sales trend</h2>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map((r) => (
              <Button key={r} size="sm" variant={range === r ? "hero" : "outline"} onClick={() => setRange(r)}>
                {r}d
              </Button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} width={54} tickFormatter={(v) => inr(v)} />
              <RTooltip formatter={(v: number) => inr(v)} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--gold))" fill="url(#salesFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-bold">Recent orders</h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/orders">View all</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
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
              {data.recent.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{o.order_number}</td>
                  <td className="px-4 py-2">{o.customer_name}</td>
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
              {!data.recent.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-bold">Top selling products</h2>
          <ul className="mt-3 space-y-3">
            {data.topProducts.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <SafeImage src={p.image} alt="" className="h-full w-full object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.units} units sold</p>
                </div>
                <span className="text-sm font-semibold">{inr(p.revenue)}</span>
              </li>
            ))}
            {!data.topProducts.length && <li className="text-sm text-muted-foreground">No sales yet.</li>}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-bold">Top categories</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-1">Category</th>
                <th className="py-1">Units</th>
                <th className="py-1">Orders</th>
                <th className="py-1 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topCategories.map((c) => (
                <tr key={c.name} className="border-t border-border">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">{c.units}</td>
                  <td className="py-2">{c.orders}</td>
                  <td className="py-2 text-right font-semibold">{inr(c.revenue)}</td>
                </tr>
              ))}
              {!data.topCategories.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No sales yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AdminPage>
  );
}
