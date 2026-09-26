import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, FolderTree, ArrowUpDown, ChevronDown, ChevronRight, Sparkles, Layers } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategoriesPage,
});

type CategoryWithSubs = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  subcategories?: {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    display_order: number;
    is_active: boolean;
  }[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryWithSubs | null>(null);

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImg, setCatImg] = useState("");
  const [catBanner, setCatBanner] = useState("");
  const [catIcon, setCatIcon] = useState("🎈");
  const [catOrder, setCatOrder] = useState(1);
  const [catActive, setCatActive] = useState(true);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, subcategories(*)")
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as CategoryWithSubs[];
    },
  });

  const openCreateModal = () => {
    setEditingCat(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatImg("");
    setCatBanner("");
    setCatIcon("🎈");
    setCatOrder((categories?.length ?? 0) + 1);
    setCatActive(true);
    setDialogOpen(true);
  };

  const openEditModal = (c: CategoryWithSubs) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || "");
    setCatImg(c.image_url || "");
    setCatBanner(c.banner_url || "");
    setCatIcon(c.icon || "🎈");
    setCatOrder(c.display_order);
    setCatActive(c.is_active);
    setDialogOpen(true);
  };

  // Save Category (Create or Update)
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim() || slugify(catName),
        description: catDesc.trim() || null,
        image_url: catImg.trim() || null,
        banner_url: catBanner.trim() || null,
        icon: catIcon.trim() || "🎈",
        display_order: Number(catOrder) || 0,
        is_active: catActive,
        updated_at: new Date().toISOString(),
      };

      if (editingCat) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingCat.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
      toast.success(editingCat ? "Category updated!" : "Category created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save category");
    },
  });

  // Delete Category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete category");
    },
  });

  // Add Subcategory
  const addSubcategoryMutation = useMutation({
    mutationFn: async () => {
      if (!activeCatForSub || !subName.trim()) return;
      const { error } = await supabase.from("subcategories").insert({
        category_id: activeCatForSub,
        name: subName.trim(),
        slug: subSlug.trim() || slugify(subName),
        display_order: 1,
        is_active: true,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setSubDialogOpen(false);
      setSubName("");
      setSubSlug("");
      toast.success("Subcategory added!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add subcategory");
    },
  });

  // Delete Subcategory
  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Subcategory removed.");
    },
  });

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Categories & Taxonomy"
      description="Manage celebration product categories, subcategories, imagery and ordering"
      actions={
        <Button onClick={openCreateModal} variant="gold" className="rounded-xl font-bold shadow-gold text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Add Category
        </Button>
      }
    >
      <div className="space-y-4">
        {categories && categories.length > 0 ? (
          <div className="grid gap-4">
            {categories.map((cat) => {
              const isExp = !!expanded[cat.id];
              const subs = cat.subcategories ?? [];

              return (
                <div key={cat.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl overflow-hidden border border-border">
                        {cat.image_url ? (
                          <SafeImage src={cat.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{cat.icon || "🎈"}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-ink">{cat.name}</h3>
                          <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                          {!cat.is_active && (
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {cat.description || "No description"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveCatForSub(cat.id);
                          setSubName("");
                          setSubSlug("");
                          setSubDialogOpen(true);
                        }}
                        className="rounded-xl text-xs"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Subcategory
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(cat)}
                        className="rounded-xl text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"? Products will become uncategorized.`)) {
                            deleteCategoryMutation.mutate(cat.id);
                          }
                        }}
                        className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        className="rounded-xl text-xs"
                      >
                        {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="ml-1 text-[11px] font-semibold">{subs.length} Subs</span>
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories panel */}
                  {isExp && (
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Subcategories for {cat.name}:
                      </p>
                      {subs.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between rounded-xl bg-secondary/50 p-2.5 text-xs"
                            >
                              <div>
                                <span className="font-semibold text-ink">{sub.name}</span>
                                <span className="block text-[10px] text-muted-foreground">/{sub.slug}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove subcategory "${sub.name}"?`)) {
                                    deleteSubMutation.mutate(sub.id);
                                  }
                                }}
                                className="text-muted-foreground hover:text-destructive p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No subcategories yet. Click &ldquo;+ Subcategory&rdquo; to add.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
            <FolderTree className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Categories Found</h3>
            <p className="text-xs text-muted-foreground">Create categories to organize celebration products.</p>
            <Button onClick={openCreateModal} variant="gold" className="rounded-xl">
              Create First Category
            </Button>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingCat ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!catName.trim()) {
                toast.error("Category name is required");
                return;
              }
              saveCategoryMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category Name *</Label>
                <Input
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCat) setCatSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Birthday & Party"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">URL Slug *</Label>
                <Input
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. birthday-party"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Short Description</Label>
              <Textarea
                rows={2}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief summary of category items..."
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Image URL (or Asset Path)</Label>
                <Input
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  placeholder="/assets/seed-balloons.jpg"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Icon / Emoji</Label>
                <Input
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="🎈"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <Label className="text-xs">Display Order</Label>
                <Input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value))}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch checked={catActive} onCheckedChange={setCatActive} id="cat-active" />
                <Label htmlFor="cat-active" className="cursor-pointer text-xs font-semibold">
                  Active in Store
                </Label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveCategoryMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveCategoryMutation.isPending ? "Saving..." : editingCat ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Modal */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Add Subcategory</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addSubcategoryMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div>
              <Label className="text-xs">Subcategory Name *</Label>
              <Input
                required
                value={subName}
                onChange={(e) => {
                  setSubName(e.target.value);
                  setSubSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Chrome Balloons"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Slug *</Label>
              <Input
                required
                value={subSlug}
                onChange={(e) => setSubSlug(e.target.value)}
                placeholder="e.g. chrome-balloons"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSubDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addSubcategoryMutation.isPending}
                className="rounded-xl bg-pink text-white font-bold hover:bg-pink/90 text-xs"
              >
                Add Subcategory
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
