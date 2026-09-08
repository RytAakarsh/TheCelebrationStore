import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { SafeImage } from "@/components/shop/SafeImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsList,
});

function useProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,slug,price,mrp,stock,low_stock_threshold,is_published,is_archived,sku,created_at,product_images(url,is_primary,position)",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

function ProductsList() {
  const { data, isLoading } = useProducts();
  const [q, setQ] = useState("");

  if (isLoading || !data) return <AdminLoading />;

  const term = q.trim().toLowerCase();
  const rows = term
    ? data.filter(
        (p) => p.name.toLowerCase().includes(term) || (p.sku ?? "").toLowerCase().includes(term),
      )
    : data;

  return (
    <AdminPage
      title="Products"
      description={`${data.length} products in your catalogue`}
      actions={
        <Button asChild variant="hero">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Link>
        </Button>
      }
    >
      <div className="mb-4 max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const images = (p.product_images ?? []) as { url: string; is_primary: boolean; position: number }[];
              const img = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <SafeImage src={img} alt="" className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku ?? "No SKU"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{inr(p.price)}</td>
                  <td className="px-4 py-2">
                    {p.stock <= 0 ? (
                      <span className="text-destructive">Out of stock</span>
                    ) : p.stock <= (p.low_stock_threshold ?? 5) ? (
                      <span className="text-gold">{p.stock} left</span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">
                      {p.is_archived ? "Archived" : p.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/admin/products/$id" params={{ id: p.id }}>
                        Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
