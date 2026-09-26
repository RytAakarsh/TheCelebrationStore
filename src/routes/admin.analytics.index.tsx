import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { inr, formatDateIST } from "@/lib/format";
import { istDayStart, istDayKey, istDayLabel } from "@/lib/admin/ist";
import { ORDER_STATUS_LABEL } from "@/lib/brand";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Award } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";

export const Route = createFileRoute("/admin/analytics/")({
  component: AdminAnalyticsPage,
});

const PIE_COLORS = ["#F05A78", "#D9A441", "#8E6CCF", "#4EA8DE", "#10B981", "#F97316"];

function AdminAnalyticsPage() {
  const [range, setRange] = useState<7 | 14 | 30>(30);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const [ordersRes, productsRes, itemsRes, categoriesRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,price,category_id,sold_count"),
        supabase.from("order_items").select("product_id,product_name,image_url,quantity,price,total,orders!inner(status,created_at,payment_method)"),
        supabase.from("categories").select("id,name"),
      ]);

      if (ordersRes.error) throw new Error(ordersRes.error.message);

      const orders = ordersRes.data ?? [];
      const products = productsRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const items = (itemsRes.data ?? []) as any[];

      const notCancelled = (s: string) => s !== "cancelled" && s !== "refunded";
      const validOrders = orders.filter((o) => notCancelled(o.status));

      const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrdersCount = orders.length;
      const validOrdersCount = validOrders.length;
      const averageOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;
      const totalUnitsSold = items
        .filter((it) => notCancelled(it.orders?.status ?? "pending"))
        .reduce((sum, it) => sum + Number(it.quantity || 0), 0);

      // Daily buckets for chart
      const buckets = new Map<string, { revenue: number; orders: number }>();
      for (let i = 29; i >= 0; i--) {
        buckets.set(istDayKey(istDayStart(i)), { revenue: 0, orders: 0 });
      }
      for (const o of orders) {
        if (!notCancelled(o.status)) continue;
        const key = istDayKey(o.created_at);
        if (buckets.has(key)) {
          const prev = buckets.get(key)!;
          prev.revenue += Number(o.total || 0);
          prev.orders += 1;
          buckets.set(key, prev);
        }
      }

      // Category breakdown
      const catMap = new Map(categories.map((c) => [c.id, c.name]));
      const prodCatMap = new Map(products.map((p) => [p.id, p.category_id]));
      const catSales = new Map<string, { name: string; revenue: number; units: number }>();

      for (const it of items) {
        if (!notCancelled(it.orders?.status ?? "pending")) continue;
        const catId = it.product_id ? prodCatMap.get(it.product_id) : null;
        const name = (catId && catMap.get(catId)) || "General";
        const prev = catSales.get(name) ?? { name, revenue: 0, units: 0 };
        prev.revenue += Number(it.total || 0);
        prev.units += Number(it.quantity || 0);
        catSales.set(name, prev);
      }

      // Top Selling Products
      const prodSales = new Map<string, { name: string; image: string | null; revenue: number; units: number }>();
      for (const it of items) {
        if (!notCancelled(it.orders?.status ?? "pending")) continue;
        const key = it.product_id || it.product_name;
        const prev = prodSales.get(key) ?? { name: it.product_name, image: it.image_url, revenue: 0, units: 0 };
        prev.revenue += Number(it.total || 0);
        prev.units += Number(it.quantity || 0);
        prodSales.set(key, prev);
      }

      // Status breakdown
      const statusCounts = new Map<string, number>();
      for (const o of orders) {
        statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
      }

      // Payment method breakdown
      let codCount = 0;
      let onlineCount = 0;
      for (const o of orders) {
        if (o.payment_method === "cod") codCount++;
        else onlineCount++;
      }

      return {
        totalRevenue,
        totalOrdersCount,
        validOrdersCount,
        averageOrderValue,
        totalUnitsSold,
        chartData: [...buckets.entries()].map(([key, val]) => ({
          day: istDayLabel(key),
          revenue: val.revenue,
          orders: val.orders,
        })),
        categoryData: [...catSales.values()].sort((a, b) => b.revenue - a.revenue),
        topProducts: [...prodSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
        statusData: [...statusCounts.entries()].map(([status, count]) => ({
          name: ORDER_STATUS_LABEL[status] ?? status,
          value: count,
        })),
        paymentData: [
          { name: "Cash on Delivery", value: codCount },
          { name: "Online / UPI", value: onlineCount },
        ],
      };
    },
  });

  if (isLoading || !analytics) return <AdminLoading />;

  const activeChartData = analytics.chartData.slice(-range);

  return (
    <AdminPage
      title="Store Performance &amp; Sales Analytics"
      description="Deep dive into customer demand, sales revenue, category distribution and top-selling celebration supplies"
    >
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink">
            {inr(analytics.totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Live database revenue</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-gold" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink">
            {analytics.totalOrdersCount}
          </p>
          <p className="text-[11px] text-muted-foreground font-semibold">{analytics.validOrdersCount} completed / active</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Order Value</span>
            <TrendingUp className="h-4 w-4 text-pink" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-pink">
            {inr(analytics.averageOrderValue)}
          </p>
          <p className="text-[11px] text-muted-foreground font-semibold">Per successful checkout</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Units Dispatched</span>
            <Award className="h-4 w-4 text-purple" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-purple">
            {analytics.totalUnitsSold}
          </p>
          <p className="text-[11px] text-muted-foreground font-semibold">Celebration items sold</p>
        </div>
      </div>

      {/* Main Revenue Trend Chart */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Revenue Timeline (IST)</h3>
            <p className="text-xs text-muted-foreground">Daily store turnover and order volume</p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
            {([7, 14, 30] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r ? "hero" : "ghost"}
                onClick={() => setRange(r)}
                className="rounded-lg text-xs font-bold h-7 px-3"
              >
                Last {r} Days
              </Button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F05A78" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#D9A441" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={55} tickFormatter={(v) => inr(v)} />
              <RTooltip formatter={(v: any) => inr(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#F05A78" fill="url(#analyticsRevenue)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Revenue Distribution (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-ink">Revenue by Category</h3>
          <p className="text-xs text-muted-foreground">Which celebration collections drive the highest demand</p>

          <div className="space-y-3 pt-2">
            {analytics.categoryData.map((cat, i) => {
              const share = analytics.totalRevenue > 0 ? Math.round((cat.revenue / analytics.totalRevenue) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink">{cat.name} ({cat.units} units)</span>
                    <span className="text-pink font-bold">{inr(cat.revenue)} ({share}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink to-gold rounded-full"
                      style={{ width: `${Math.max(5, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 8 Selling Products (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-ink">Top Selling Products</h3>
          <p className="text-xs text-muted-foreground">Most popular items ranked by total order revenue</p>

          <div className="divide-y divide-border space-y-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {analytics.topProducts.map((p, i) => (
              <div key={p.name + i} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-gold text-sm w-4 shrink-0">#{i + 1}</span>
                  <div className="h-9 w-9 shrink-0 bg-secondary rounded-lg overflow-hidden p-0.5 border">
                    {p.image ? (
                      <SafeImage src={p.image} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="grid h-full place-items-center text-[10px]">✨</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-ink truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.units} units sold</p>
                  </div>
                </div>

                <span className="font-display font-bold text-ink shrink-0">{inr(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
