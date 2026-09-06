import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Vizag Party World" },
      { name: "description", content: "Manage products, orders and customers for Vizag Party World." },
      { property: "og:title", content: "Admin Dashboard — Vizag Party World" },
      { property: "og:description", content: "Store management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { user, isAdmin, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [orders, products, customers] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("id,stock,low_stock_threshold,is_published"),
        supabase.from("profiles").select("id"),
      ]);
      const orderRows = orders.data ?? [];
      return {
        revenue: orderRows
          .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
          .reduce((s, o) => s + Number(o.total), 0),
        orderCount: orderRows.length,
        productCount: (products.data ?? []).length,
        lowStock: (products.data ?? []).filter((p) => p.stock <= (p.low_stock_threshold ?? 5)).length,
        customerCount: (customers.data ?? []).length,
      };
    },
  });

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Admin" />
        <EmptyState
          title="Sign in required"
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/admin" }}>Sign in</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  if (!loading && user && !isAdmin) {
    return (
      <ShopLayout>
        <PageHeader title="Admin" />
        <EmptyState title="You don't have admin access" description="Ask the store owner to grant you admin rights." />
      </ShopLayout>
    );
  }

  const cards = [
    { label: "Total revenue", value: inr(stats?.revenue ?? 0) },
    { label: "Orders", value: String(stats?.orderCount ?? 0) },
    { label: "Products", value: String(stats?.productCount ?? 0) },
    { label: "Low stock", value: String(stats?.lowStock ?? 0) },
    { label: "Customers", value: String(stats?.customerCount ?? 0) },
  ];

  return (
    <ShopLayout>
      <PageHeader title="Admin Dashboard" subtitle="Vizag Party World store overview" />
      <div className="container-page grid grid-cols-2 gap-3 py-6 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-product p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </ShopLayout>
  );
}
