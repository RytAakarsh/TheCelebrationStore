import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Boxes, Search, AlertTriangle, CheckCircle2, Save, Minus, Plus } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/inventory/")({
  component: AdminInventoryPage,
});

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  low_stock_threshold: number;
  moq: number;
  price: number;
  track_inventory: boolean;
  category_id: string | null;
  category_name?: string;
  image_url: string | null;
  sold_count: number;
};

function AdminInventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,sku,stock,low_stock_threshold,moq,price,track_inventory,category_id,sold_count,product_images(url,is_primary)")
          .order("stock", { ascending: true }),
        supabase.from("categories").select("id,name"),
      ]);

      if (productsRes.error) throw new Error(productsRes.error.message);
      const catMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c.name]));

      return (productsRes.data ?? []).map((p: any) => {
        const primaryImg = p.product_images?.find((i: any) => i.is_primary)?.url || p.product_images?.[0]?.url || null;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: Number(p.stock || 0),
          low_stock_threshold: Number(p.low_stock_threshold || 5),
          moq: Number(p.moq || 1),
          price: Number(p.price || 0),
          track_inventory: p.track_inventory ?? true,
          category_id: p.category_id,
          category_name: p.category_id ? catMap.get(p.category_id) || "—" : "—",
          image_url: primaryImg,
          sold_count: Number(p.sold_count || 0),
        } as InventoryItem;
      });
    },
  });

  // Quick Stock Update Mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, newStock }: { id: string; newStock: number }) => {
      setSavingId(id);
      const { error } = await supabase.from("products").update({ stock: Math.max(0, newStock) }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { id, newStock }) => {
      qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setStockEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSavingId(null);
      toast.success(`Stock updated to ${newStock}!`);
    },
    onError: (err: any) => {
      setSavingId(null);
      toast.error(err.message || "Failed to update stock");
    },
  });

  if (isLoading) return <AdminLoading />;

  const filtered = (inventory ?? []).filter((item) => {
    if (filter === "out" && item.stock > 0) return false;
    if (filter === "low" && (item.stock <= 0 || item.stock > item.low_stock_threshold)) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return item.name.toLowerCase().includes(term) || item.sku?.toLowerCase().includes(term);
  });

  const outOfStockCount = (inventory ?? []).filter((i) => i.stock <= 0).length;
  const lowStockCount = (inventory ?? []).filter((i) => i.stock > 0 && i.stock <= i.low_stock_threshold).length;
  const inStockCount = (inventory ?? []).filter((i) => i.stock > i.low_stock_threshold).length;

  return (
    <AdminPage
      title="Inventory & Stock Manager"
      description="Monitor live celebration stock levels, adjust warehouse quantities and track low inventory"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Catalog Items</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">{inventory?.length ?? 0}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">In Stock</p>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-1">{inStockCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Low Stock Alert</p>
          <p className="font-display text-2xl font-bold text-gold mt-1">{lowStockCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Out of Stock</p>
          <p className="font-display text-2xl font-bold text-destructive mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-2xl bg-secondary/60 p-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "all" ? "bg-card text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            All Items ({inventory?.length ?? 0})
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "low" ? "bg-gold text-ink font-bold shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("out")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "out" ? "bg-destructive text-white shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-1.5 shadow-sm min-w-[280px]">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="border-0 shadow-none focus-visible:ring-0 text-xs h-8"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead className="bg-secondary/60 text-muted-foreground uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">MOQ</th>
                <th className="px-5 py-3.5">Sold Units</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Quick Stock Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const currentStock = stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
                  const isDirty = stockEdits[item.id] !== undefined && stockEdits[item.id] !== item.stock;
                  const isSaving = savingId === item.id;
                  const isLow = item.stock > 0 && item.stock <= item.low_stock_threshold;
                  const isOut = item.stock <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 bg-secondary rounded-xl overflow-hidden p-1 border border-border">
                            {item.image_url ? (
                              <SafeImage src={item.image_url} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <div className="grid h-full place-items-center text-xs text-muted-foreground">📦</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate max-w-xs">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">SKU: {item.sku || "—"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {item.category_name}
                      </td>

                      <td className="px-5 py-4 font-bold text-ink">
                        {inr(item.price)}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground font-semibold">
                        {item.moq} pcs
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold text-ink">
                          {item.sold_count}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isOut ? (
                          <span className="rounded-full bg-destructive/15 text-destructive px-2.5 py-1 text-[10px] font-bold">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="rounded-full bg-amber-500/15 text-amber-700 px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" /> Low ({item.stock})
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[10px] font-bold">
                            In Stock ({item.stock})
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-xl border border-border bg-card">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.max(0, (currentStock ?? 0) - 10);
                                setStockEdits((prev) => ({ ...prev, [item.id]: nextVal }));
                              }}
                              className="px-2 py-1 text-muted-foreground hover:text-ink text-xs font-bold"
                              title="Decrease 10"
                            >
                              -10
                            </button>
                            <Input
                              type="number"
                              value={currentStock}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                setStockEdits((prev) => ({ ...prev, [item.id]: val }));
                              }}
                              className="h-8 w-16 text-center border-0 font-bold text-xs p-0 focus-visible:ring-0"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = (currentStock ?? 0) + 10;
                                setStockEdits((prev) => ({ ...prev, [item.id]: nextVal }));
                              }}
                              className="px-2 py-1 text-muted-foreground hover:text-ink text-xs font-bold"
                              title="Increase 10"
                            >
                              +10
                            </button>
                          </div>

                          {isDirty && (
                            <Button
                              size="sm"
                              disabled={isSaving}
                              onClick={() => updateStockMutation.mutate({ id: item.id, newStock: currentStock ?? 0 })}
                              className="rounded-xl bg-gold text-ink hover:bg-gold-premium font-bold text-xs h-8 px-3 shadow-gold"
                            >
                              <Save className="h-3.5 w-3.5 mr-1" /> Save
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No products found matching &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
