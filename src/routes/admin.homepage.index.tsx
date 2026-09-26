import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Home, ArrowUpDown, Sparkles, Layers, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/homepage/")({
  component: AdminHomepageSectionsPage,
});

type SectionRecord = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  source: string;
  category_id: string | null;
  display_order: number;
  is_active: boolean;
  max_items?: number;
};

function AdminHomepageSectionsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionRecord | null>(null);

  // Form State
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [source, setSource] = useState("category");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Fetch sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ["admin", "home_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_sections")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  // Fetch categories for mapping
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories_for_sections"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,slug").eq("is_active", true);
      return data ?? [];
    },
  });

  const openCreateModal = () => {
    setEditingSection(null);
    setKey(`section_${Date.now().toString().slice(-4)}`);
    setTitle("Celebration Collection");
    setSubtitle("Curated festive supplies");
    setSource("category");
    setCategoryId(categories?.[0]?.id ?? null);
    setDisplayOrder((sections?.length ?? 0) + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditModal = (s: SectionRecord) => {
    setEditingSection(s);
    setKey(s.key);
    setTitle(s.title);
    setSubtitle(s.subtitle || "");
    setSource(s.source);
    setCategoryId(s.category_id || null);
    setDisplayOrder(s.display_order);
    setIsActive(s.is_active);
    setDialogOpen(true);
  };

  // Toggle quick switch
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("home_sections").update({ is_active: active }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "home_sections"] });
      qc.invalidateQueries({ queryKey: ["home_sections"] });
      toast.success("Homepage layout updated!");
    },
  });

  // Save Mutation
  const saveSectionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        key: key.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        source,
        category_id: source === "category" ? categoryId : null,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };

      if (editingSection) {
        const { error } = await supabase.from("home_sections").update(payload).eq("id", editingSection.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("home_sections").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "home_sections"] });
      qc.invalidateQueries({ queryKey: ["home_sections"] });
      setDialogOpen(false);
      toast.success(editingSection ? "Section updated!" : "Homepage section created!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save section");
    },
  });

  // Delete Mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_sections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "home_sections"] });
      qc.invalidateQueries({ queryKey: ["home_sections"] });
      toast.success("Section removed from homepage.");
    },
  });

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Homepage Sections Manager"
      description="Control the order, visibility and content sources of all sections displayed on the storefront"
      actions={
        <Button onClick={openCreateModal} variant="gold" className="rounded-xl font-bold shadow-gold text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Add Section
        </Button>
      }
    >
      <div className="space-y-4">
        {sections && sections.length > 0 ? (
          <div className="grid gap-3.5">
            {sections.map((sec) => {
              const matchedCat = categories?.find((c) => c.id === sec.category_id);

              return (
                <div key={sec.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold font-bold text-sm">
                        #{sec.display_order}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-ink">{sec.title}</h3>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-ink uppercase">
                            {sec.source}
                          </span>
                          {matchedCat && (
                            <span className="rounded-full bg-pink/10 px-2.5 py-0.5 text-[10px] font-bold text-pink">
                              Cat: {matchedCat.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{sec.subtitle || "No subtitle"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sec.is_active}
                          onCheckedChange={(active) => toggleMutation.mutate({ id: sec.id, active })}
                          id={`toggle-${sec.id}`}
                        />
                        <Label htmlFor={`toggle-${sec.id}`} className="text-xs font-semibold cursor-pointer">
                          {sec.is_active ? "Visible" : "Hidden"}
                        </Label>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(sec)}
                        className="rounded-xl text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Remove section "${sec.title}"?`)) {
                            deleteSectionMutation.mutate(sec.id);
                          }
                        }}
                        className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
            <Home className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Homepage Sections Configured</h3>
            <p className="text-xs text-muted-foreground">Add sections to control what is showcased on your homepage.</p>
            <Button onClick={openCreateModal} variant="gold" className="rounded-xl">
              Create First Section
            </Button>
          </div>
        )}
      </div>

      {/* Section Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingSection ? "Edit Homepage Section" : "Create Homepage Section"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim() || !key.trim()) {
                toast.error("Section title and key are required");
                return;
              }
              saveSectionMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Section Key *</Label>
                <Input
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. birthday_picks"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Data Source</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs mt-1"
                >
                  <option value="category">Category Products</option>
                  <option value="bestseller">Best Sellers</option>
                  <option value="featured">Featured Picks</option>
                  <option value="offer">Live Offers</option>
                  <option value="new_arrivals">New Arrivals</option>
                  <option value="trending">Trending Now</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Section Heading Title *</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Popular for Birthdays"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Subtitle / Label</Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Balloons, candles & party essentials"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            {source === "category" && (
              <div>
                <Label className="text-xs">Link to Category</Label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs mt-1"
                >
                  <option value="">Select a Category...</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (/{c.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <Label className="text-xs">Display Priority Order</Label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="sec-active" />
                <Label htmlFor="sec-active" className="cursor-pointer text-xs font-semibold">
                  Visible on Homepage
                </Label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveSectionMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveSectionMutation.isPending ? "Saving..." : editingSection ? "Update Section" : "Create Section"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
