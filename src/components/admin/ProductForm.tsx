import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminLoading } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";

type VariantDraft = {
  id?: string;
  name: string;
  color_name: string;
  color_hex: string;
  sku: string;
  price: string;
  mrp: string;
  stock: string;
  moq: string;
  is_active: boolean;
};

type Draft = {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category_id: string;
  subcategory_id: string;
  short_description: string;
  description: string;
  mrp: string;
  price: string;
  moq: string;
  stock: string;
  low_stock_threshold: string;
  tags: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_published: boolean;
  is_archived: boolean;
};

const EMPTY: Draft = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  category_id: "",
  subcategory_id: "",
  short_description: "",
  description: "",
  mrp: "",
  price: "",
  moq: "1",
  stock: "0",
  low_stock_threshold: "5",
  tags: "",
  is_featured: false,
  is_bestseller: false,
  is_new: true,
  is_trending: false,
  is_published: true,
  is_archived: false,
};

export function ProductForm({ productId }: { productId?: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: taxonomy } = useQuery({
    queryKey: ["admin", "taxonomy"],
    queryFn: async () => {
      const [cats, subs] = await Promise.all([
        supabase.from("categories").select("id,name").order("display_order"),
        supabase.from("subcategories").select("id,name,category_id").order("display_order"),
      ]);
      return { categories: cats.data ?? [], subcategories: subs.data ?? [] };
    },
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "product", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id,url,position,is_primary), product_variants(*)")
        .eq("id", productId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    if (!existing) return;
    setSlugTouched(true);
    setDraft({
      name: existing.name ?? "",
      slug: existing.slug ?? "",
      sku: existing.sku ?? "",
      brand: existing.brand ?? "",
      category_id: existing.category_id ?? "",
      subcategory_id: existing.subcategory_id ?? "",
      short_description: existing.short_description ?? "",
      description: existing.description ?? "",
      mrp: String(existing.mrp ?? ""),
      price: String(existing.price ?? ""),
      moq: String(existing.moq ?? 1),
      stock: String(existing.stock ?? 0),
      low_stock_threshold: String(existing.low_stock_threshold ?? 5),
      tags: (existing.tags ?? []).join(", "),
      is_featured: !!existing.is_featured,
      is_bestseller: !!existing.is_bestseller,
      is_new: !!existing.is_new,
      is_trending: !!existing.is_trending,
      is_published: !!existing.is_published,
      is_archived: !!existing.is_archived,
    });
    const imgs = [...(existing.product_images ?? [])].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    );
    setImages(imgs.map((i) => i.url));
    setVariants(
      [...(existing.product_variants ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((v) => ({
          id: v.id,
          name: v.name,
          color_name: v.color_name ?? "",
          color_hex: v.color_hex ?? "",
          sku: v.sku ?? "",
          price: v.price == null ? "" : String(v.price),
          mrp: v.mrp == null ? "" : String(v.mrp),
          stock: String(v.stock ?? 0),
          moq: String(v.moq ?? 1),
          is_active: !!v.is_active,
        })),
    );
  }, [existing]);

  const subcategories = useMemo(
    () => (taxonomy?.subcategories ?? []).filter((s) => s.category_id === draft.category_id),
    [taxonomy, draft.category_id],
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const name = draft.name.trim();
      if (!name) throw new Error("Product name is required");
      const price = Number(draft.price);
      const mrp = Number(draft.mrp || draft.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid selling price");
      if (mrp < price) throw new Error("MRP cannot be lower than the selling price");
      const slug = (slugTouched && draft.slug.trim() ? draft.slug.trim() : slugify(name)) || slugify(name);

      const payload = {
        name,
        slug,
        sku: draft.sku.trim() || null,
        brand: draft.brand.trim() || null,
        category_id: draft.category_id || null,
        subcategory_id: draft.subcategory_id || null,
        short_description: draft.short_description.trim() || null,
        description: draft.description.trim() || null,
        mrp,
        price,
        moq: Math.max(1, Number(draft.moq) || 1),
        stock: Math.max(0, Number(draft.stock) || 0),
        low_stock_threshold: Math.max(0, Number(draft.low_stock_threshold) || 0),
        tags: draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        is_featured: draft.is_featured,
        is_bestseller: draft.is_bestseller,
        is_new: draft.is_new,
        is_trending: draft.is_trending,
        is_published: draft.is_published,
        is_archived: draft.is_archived,
      };

      let id = productId;
      if (id) {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw new Error(error.message);
        id = data.id;
      }

      // images: replace set (order = position, first = primary)
      await supabase.from("product_images").delete().eq("product_id", id!);
      if (images.length) {
        const { error } = await supabase.from("product_images").insert(
          images.slice(0, 5).map((url, i) => ({
            product_id: id!,
            url,
            position: i,
            is_primary: i === 0,
          })),
        );
        if (error) throw new Error(error.message);
      }

      // variants
      const keepIds = variants.map((v) => v.id).filter(Boolean) as string[];
      const del = supabase.from("product_variants").delete().eq("product_id", id!);
      await (keepIds.length ? del.not("id", "in", `(${keepIds.join(",")})`) : del);

      for (const [i, v] of variants.entries()) {
        const row = {
          product_id: id!,
          name: v.name.trim() || `Option ${i + 1}`,
          color_name: v.color_name.trim() || null,
          color_hex: v.color_hex.trim() || null,
          sku: v.sku.trim() || null,
          price: v.price === "" ? null : Number(v.price),
          mrp: v.mrp === "" ? null : Number(v.mrp),
          stock: Math.max(0, Number(v.stock) || 0),
          moq: Math.max(1, Number(v.moq) || 1),
          is_active: v.is_active,
          position: i,
        };
        if (v.id) {
          const { error } = await supabase.from("product_variants").update(row).eq("id", v.id);
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.from("product_variants").insert(row);
          if (error) throw new Error(error.message);
        }
      }

      return id!;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(productId ? "Product updated" : "Product created");
      navigate({ to: "/admin/products" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save product"),
  });

  if (productId && isLoading) return <AdminLoading />;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="p-name">Product name *</Label>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-slug">URL slug</Label>
            <Input
              id="p-slug"
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-sku">SKU</Label>
            <Input id="p-sku" value={draft.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={draft.category_id || "none"}
              onValueChange={(v) => {
                set("category_id", v === "none" ? "" : v);
                set("subcategory_id", "");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {(taxonomy?.categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subcategory</Label>
            <Select
              value={draft.subcategory_id || "none"}
              onValueChange={(v) => set("subcategory_id", v === "none" ? "" : v)}
              disabled={!subcategories.length}
            >
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-brand">Brand</Label>
            <Input id="p-brand" value={draft.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-tags">Tags (comma separated)</Label>
            <Input id="p-tags" value={draft.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="p-short">Short description</Label>
            <Input id="p-short" value={draft.short_description} onChange={(e) => set("short_description", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="p-desc">Full description</Label>
            <Textarea id="p-desc" rows={5} value={draft.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">Pricing & stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-mrp">MRP (₹)</Label>
            <Input id="p-mrp" type="number" min={0} step="0.01" value={draft.mrp} onChange={(e) => set("mrp", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-price">Selling price (₹) *</Label>
            <Input id="p-price" type="number" min={0} step="0.01" required value={draft.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-moq">Minimum order quantity</Label>
            <Input id="p-moq" type="number" min={1} value={draft.moq} onChange={(e) => set("moq", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-stock">Stock</Label>
            <Input id="p-stock" type="number" min={0} value={draft.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-low">Low stock alert at</Label>
            <Input id="p-low" type="number" min={0} value={draft.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <ImageUploader urls={images} onChange={setImages} max={5} folder="products" label="Product images" />
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Variants</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setVariants((v) => [
                ...v,
                { name: "", color_name: "", color_hex: "", sku: "", price: "", mrp: "", stock: "0", moq: "1", is_active: true },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add variant
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-7">
              <Input placeholder="Name" value={v.name} onChange={(e) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} />
              <Input placeholder="Colour" value={v.color_name} onChange={(e) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, color_name: e.target.value } : x)))} />
              <Input type="color" value={v.color_hex || "#cccccc"} onChange={(e) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, color_hex: e.target.value } : x)))} />
              <Input placeholder="Price" type="number" value={v.price} onChange={(e) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, price: e.target.value } : x)))} />
              <Input placeholder="Stock" type="number" value={v.stock} onChange={(e) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, stock: e.target.value } : x)))} />
              <div className="flex items-center gap-2">
                <Switch checked={v.is_active} onCheckedChange={(c) => setVariants((all) => all.map((x, idx) => (idx === i ? { ...x, is_active: c } : x)))} />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove variant" onClick={() => setVariants((all) => all.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!variants.length && <p className="text-sm text-muted-foreground">No variants — the product is sold as a single option.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">Visibility & badges</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {([
            ["is_published", "Published"],
            ["is_archived", "Archived"],
            ["is_featured", "Featured"],
            ["is_bestseller", "Bestseller"],
            ["is_new", "New arrival"],
            ["is_trending", "Trending"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <Switch checked={draft[key]} onCheckedChange={(c) => set(key, c)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background/95 py-3 backdrop-blur">
        <Button type="submit" variant="hero" size="lg" disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => navigate({ to: "/admin/products" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
