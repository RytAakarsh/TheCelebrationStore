import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { SafeImage } from "@/components/shop/SafeImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          "id,name,slug,price,mrp,stock,moq,low_stock_threshold,is_published,is_archived,is_featured,is_bestseller,sku,category_id,created_at,product_images(url,is_primary,position)",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

function ProductsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useProducts();
  const [q, setQ] = useState("");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const duplicateProduct = useMutation({
    mutationFn: async (productId: string) => {
      // 1. Fetch source product
      const { data: source, error: srcErr } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("id", productId)
        .single();
      if (srcErr) throw new Error(srcErr.message);

      const timestamp = Date.now().toString().slice(-4);
      const newSlug = `${source.slug}-copy-${timestamp}`;
      const newName = `${source.name} (Copy)`;

      // 2. Insert new product
      const { id: _, created_at: _c, updated_at: _u, product_images: _imgs, product_variants: _vars, ...rest } = source;
      const { data: newProd, error: insertErr } = await supabase
        .from("products")
        .insert({
          ...rest,
          name: newName,
          slug: newSlug,
          sku: source.sku ? `${source.sku}-COPY` : null,
          is_published: false, // create as draft
        })
        .select("id")
        .single();
      if (insertErr) throw new Error(insertErr.message);

      // 3. Copy images
      if (source.product_images && source.product_images.length > 0) {
        const imgsToInsert = source.product_images.map((img: any) => ({
          product_id: newProd.id,
          url: img.url,
          position: img.position,
          is_primary: img.is_primary,
        }));
        await supabase.from("product_images").insert(imgsToInsert);
      }

      // 4. Copy variants
      if (source.product_variants && source.product_variants.length > 0) {
        const varsToInsert = source.product_variants.map((v: any) => {
          const { id: _vid, created_at: _vc, product_id: _p, ...vRest } = v;
          return {
            ...vRest,
            product_id: newProd.id,
          };
        });
        await supabase.from("product_variants").insert(varsToInsert);
      }

      return newProd.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product duplicated as Draft");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to duplicate product");
    },
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("products").update({ is_published }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Visibility updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  if (isLoading || !data) return <AdminLoading />;

  const term = q.trim().toLowerCase();
  const rows = data.filter((p) => {
    const matchesQuery =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.sku ?? "").toLowerCase().includes(term);

    const matchesStock =
      filterStock === "all" ||
      (filterStock === "in" && p.stock > (p.low_stock_threshold ?? 5)) ||
      (filterStock === "low" && p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5)) ||
      (filterStock === "out" && p.stock <= 0);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && p.is_published && !p.is_archived) ||
      (filterStatus === "draft" && !p.is_published && !p.is_archived) ||
      (filterStatus === "archived" && p.is_archived);

    return matchesQuery && matchesStock && matchesStatus;
  });

  return (
    <AdminPage
      title="Products Catalogue"
      description={`${data.length} total products in database`}
      actions={
        <Button asChild variant="hero">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      }
    >
      {/* Filters Bar */}
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="pl-9"
          />
        </div>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger>
            <SelectValue placeholder="Stock Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Levels</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock Alert</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Visibility Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price & MRP</th>
              <th className="px-4 py-3">Stock & MOQ</th>
              <th className="px-4 py-3">Badges</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => {
              const images = (p.product_images ?? []) as {
                url: string;
                is_primary: boolean;
                position: number;
              }[];
              const img = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
              const isLowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5);
              const isOutOfStock = p.stock <= 0;

              return (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                        <SafeImage src={img} alt={p.name} className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="truncate font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku ? `SKU: ${p.sku}` : "No SKU"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{inr(p.price)}</div>
                    {p.mrp > p.price && (
                      <div className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="text-[11px]">
                        Out of Stock
                      </Badge>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                        {p.stock} left
                      </span>
                    ) : (
                      <span className="text-sm font-medium">{p.stock} units</span>
                    )}
                    {p.moq > 1 && (
                      <div className="text-[11px] text-muted-foreground">MOQ: {p.moq}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && (
                        <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                          Featured
                        </span>
                      )}
                      {p.is_bestseller && (
                        <span className="rounded bg-pink/20 px-1.5 py-0.5 text-[10px] font-semibold text-pink">
                          Bestseller
                        </span>
                      )}
                      {!p.is_featured && !p.is_bestseller && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => togglePublished.mutate({ id: p.id, is_published: !p.is_published })}
                      className="cursor-pointer"
                      title="Click to toggle publish status"
                    >
                      <Badge
                        variant={p.is_published ? "default" : "outline"}
                        className={p.is_published ? "bg-emerald-600 hover:bg-emerald-700" : "text-muted-foreground"}
                      >
                        {p.is_archived ? "Archived" : p.is_published ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="icon" variant="ghost" title="View in Store">
                        <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Duplicate Product"
                        disabled={duplicateProduct.isPending}
                        onClick={() => duplicateProduct.mutate(p.id)}
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button asChild size="icon" variant="ghost" title="Edit Product">
                        <Link to="/admin/products/$id" params={{ id: p.id }}>
                          <Edit className="h-4 w-4 text-gold" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No products matched your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
