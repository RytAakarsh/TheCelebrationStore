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
import { Plus, Edit2, Trash2, Tag, Calendar, Sparkles, Check, Package } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";
import { inr, formatDateIST } from "@/lib/format";

export const Route = createFileRoute("/admin/offers/")({
  component: AdminOffersPage,
});

type OfferRecord = {
  id: string;
  name: string;
  banner_url: string | null;
  discount_type: string;
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  is_active: boolean;
  productCount?: number;
  productIds?: string[];
};

function AdminOffersPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [activeOfferForAssign, setActiveOfferForAssign] = useState<OfferRecord | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Selected Products for Offer Assignment
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Fetch offers + product links
  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin", "offers"],
    queryFn: async () => {
      const [offersRes, linksRes] = await Promise.all([
        supabase.from("offers").select("*").order("display_order", { ascending: true }),
        supabase.from("offer_products").select("offer_id,product_id"),
      ]);

      if (offersRes.error) throw new Error(offersRes.error.message);
      const links = linksRes.data ?? [];

      return (offersRes.data ?? []).map((o) => {
        const assigned = links.filter((l) => l.offer_id === o.id).map((l) => l.product_id);
        return {
          ...o,
          productCount: assigned.length,
          productIds: assigned,
        } as OfferRecord;
      });
    },
  });

  // Fetch products for assignment
  const { data: products } = useQuery({
    queryKey: ["admin", "products_for_offers"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id,name,price,mrp,sku,product_images(url,is_primary)").eq("is_published", true);
      return data ?? [];
    },
  });

  const openCreateModal = () => {
    setEditingOffer(null);
    setName("");
    setBannerUrl("");
    setDiscountType("percent");
    setDiscountValue(10);
    setStartsAt(new Date().toISOString().slice(0, 16));
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setEndsAt(nextMonth.toISOString().slice(0, 16));
    setDisplayOrder((offers?.length ?? 0) + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditModal = (o: OfferRecord) => {
    setEditingOffer(o);
    setName(o.name);
    setBannerUrl(o.banner_url || "");
    setDiscountType((o.discount_type as any) || "percent");
    setDiscountValue(Number(o.discount_value) || 0);
    setStartsAt(o.starts_at ? new Date(o.starts_at).toISOString().slice(0, 16) : "");
    setEndsAt(o.ends_at ? new Date(o.ends_at).toISOString().slice(0, 16) : "");
    setDisplayOrder(o.display_order);
    setIsActive(o.is_active);
    setDialogOpen(true);
  };

  const openAssignModal = (o: OfferRecord) => {
    setActiveOfferForAssign(o);
    setSelectedProductIds(o.productIds ?? []);
    setAssignDialogOpen(true);
  };

  // Save Offer Mutation
  const saveOfferMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        banner_url: bannerUrl.trim() || null,
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };

      if (editingOffer) {
        const { error } = await supabase.from("offers").update(payload).eq("id", editingOffer.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("offers").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offer_products"] });
      setDialogOpen(false);
      toast.success(editingOffer ? "Offer updated!" : "Offer created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save offer");
    },
  });

  // Delete Offer Mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offer_products"] });
      toast.success("Offer deleted.");
    },
  });

  // Save Assigned Products Mutation
  const saveAssignedMutation = useMutation({
    mutationFn: async () => {
      if (!activeOfferForAssign) return;
      // Delete old links
      await supabase.from("offer_products").delete().eq("offer_id", activeOfferForAssign.id);
      // Insert new links
      if (selectedProductIds.length > 0) {
        const inserts = selectedProductIds.map((pid) => ({
          offer_id: activeOfferForAssign.id,
          product_id: pid,
        }));
        const { error } = await supabase.from("offer_products").insert(inserts);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offer_products"] });
      setAssignDialogOpen(false);
      toast.success("Offer products updated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update offer products");
    },
  });

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Live Celebration Offers"
      description="Manage discounted deals, promotional banners, start/end dates and offer products"
      actions={
        <Button onClick={openCreateModal} variant="gold" className="rounded-xl font-bold shadow-gold text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Create Offer Deal
        </Button>
      }
    >
      <div className="space-y-4">
        {offers && offers.length > 0 ? (
          <div className="grid gap-4">
            {offers.map((offer) => {
              const now = new Date();
              const isExpired = offer.ends_at && new Date(offer.ends_at) < now;
              const isUpcoming = offer.starts_at && new Date(offer.starts_at) > now;

              return (
                <div key={offer.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink/20 to-gold/20 text-gold text-xl overflow-hidden border border-border">
                        {offer.banner_url ? (
                          <SafeImage src={offer.banner_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Tag className="h-6 w-6 text-pink" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-ink">{offer.name}</h3>
                          <span className="rounded-full bg-pink px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {offer.discount_type === "percent" ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                          </span>
                          {isExpired ? (
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                              Expired
                            </span>
                          ) : isUpcoming ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              Upcoming
                            </span>
                          ) : offer.is_active ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Active in Store
                            </span>
                          ) : (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Disabled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gold" />
                            <span>
                              {offer.starts_at ? formatDateIST(offer.starts_at) : "Starts now"} →{" "}
                              {offer.ends_at ? formatDateIST(offer.ends_at) : "Ongoing"}
                            </span>
                          </span>
                          <span>• Display Order: #{offer.display_order}</span>
                          <span className="font-semibold text-pink">• {offer.productCount} Products Linked</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignModal(offer)}
                        className="rounded-xl text-xs font-semibold"
                      >
                        <Package className="mr-1.5 h-3.5 w-3.5 text-gold" /> Assign Products ({offer.productCount})
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(offer)}
                        className="rounded-xl text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete offer "${offer.name}"?`)) {
                            deleteOfferMutation.mutate(offer.id);
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
            <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Live Offers Created</h3>
            <p className="text-xs text-muted-foreground">Create promotional campaigns to display live discount deals on the homepage.</p>
            <Button onClick={openCreateModal} variant="gold" className="rounded-xl">
              Create First Offer Deal
            </Button>
          </div>
        )}
      </div>

      {/* Offer Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingOffer ? "Edit Offer Deal" : "Create Celebration Offer"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) {
                toast.error("Offer name is required");
                return;
              }
              saveOfferMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div>
              <Label className="text-xs">Offer Campaign Title *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grand Celebration Savings"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Discount Type</Label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs mt-1"
                >
                  <option value="percent">Percentage Discount (%)</option>
                  <option value="fixed">Flat Amount Discount (₹)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Discount Value *</Label>
                <Input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">End Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Promotional Banner Image URL</Label>
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="/assets/hero-1.jpg or image URL"
                className="rounded-xl text-xs mt-1"
              />
            </div>

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
                <Switch checked={isActive} onCheckedChange={setIsActive} id="offer-active" />
                <Label htmlFor="offer-active" className="cursor-pointer text-xs font-semibold">
                  Enable in Store
                </Label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveOfferMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveOfferMutation.isPending ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] rounded-3xl p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Select Products for &ldquo;{activeOfferForAssign?.name}&rdquo;
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            Check the products you want to feature under this live promotion.
          </p>

          <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-border border rounded-2xl p-2 my-3 space-y-1">
            {(products ?? []).map((p) => {
              const isChecked = selectedProductIds.includes(p.id);
              const img = p.product_images?.find((i: any) => i.is_primary)?.url || p.product_images?.[0]?.url;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isChecked) {
                      setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                    } else {
                      setSelectedProductIds([...selectedProductIds, p.id]);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    isChecked ? "bg-gold/10 font-bold" : "hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-gold h-4 w-4 rounded"
                    />
                    <div className="h-10 w-10 shrink-0 bg-secondary rounded-lg overflow-hidden p-1 border">
                      {img && <SafeImage src={img} alt="" className="h-full w-full object-contain" />}
                    </div>
                    <div>
                      <p className="text-xs text-ink">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">SKU: {p.sku || "—"} • {inr(p.price)}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-pink">{inr(p.price)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {selectedProductIds.length} Products Selected
            </span>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                onClick={() => saveAssignedMutation.mutate()}
                disabled={saveAssignedMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveAssignedMutation.isPending ? "Saving Links..." : "Save Selection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
