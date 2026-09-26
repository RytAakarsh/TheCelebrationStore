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
import { Plus, Edit2, Trash2, Images, Sparkles, ArrowRight, Eye } from "lucide-react";
import { SafeImage } from "@/components/shop/SafeImage";

export const Route = createFileRoute("/admin/banners/")({
  component: AdminBannersPage,
});

type BannerRecord = {
  id: string;
  heading: string | null;
  subheading: string | null;
  cta_text: string | null;
  cta_link: string | null;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  is_active: boolean;
};

function AdminBannersPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRecord | null>(null);

  // Form State
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [ctaText, setCtaText] = useState("Shop Celebration Essentials");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [desktopImg, setDesktopImg] = useState("");
  const [mobileImg, setMobileImg] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin", "hero_banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setHeading("Make Every Moment Special");
    setSubheading("Everything you need for birthdays, weddings, gifting and unforgettable celebrations.");
    setCtaText("Shop Celebration Essentials");
    setCtaLink("/shop");
    setDesktopImg("/assets/hero-1.jpg");
    setMobileImg("/assets/hero-1.jpg");
    setStartsAt("");
    setEndsAt("");
    setDisplayOrder((banners?.length ?? 0) + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditModal = (b: BannerRecord) => {
    setEditingBanner(b);
    setHeading(b.heading || "");
    setSubheading(b.subheading || "");
    setCtaText(b.cta_text || "Shop Now");
    setCtaLink(b.cta_link || "/shop");
    setDesktopImg(b.desktop_image_url || "");
    setMobileImg(b.mobile_image_url || "");
    setStartsAt(b.starts_at ? new Date(b.starts_at).toISOString().slice(0, 16) : "");
    setEndsAt(b.ends_at ? new Date(b.ends_at).toISOString().slice(0, 16) : "");
    setDisplayOrder(b.display_order);
    setIsActive(b.is_active);
    setDialogOpen(true);
  };

  // Save Mutation
  const saveBannerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        cta_text: ctaText.trim() || null,
        cta_link: ctaLink.trim() || null,
        desktop_image_url: desktopImg.trim() || null,
        mobile_image_url: mobileImg.trim() || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };

      if (editingBanner) {
        const { error } = await supabase.from("hero_banners").update(payload).eq("id", editingBanner.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("hero_banners").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "hero_banners"] });
      qc.invalidateQueries({ queryKey: ["hero_banners"] });
      setDialogOpen(false);
      toast.success(editingBanner ? "Banner updated!" : "Hero banner created!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save banner");
    },
  });

  // Delete Mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "hero_banners"] });
      qc.invalidateQueries({ queryKey: ["hero_banners"] });
      toast.success("Banner deleted.");
    },
  });

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Hero Carousel Banners"
      description="Manage dynamic top banners, call-to-action buttons, mobile images and schedules"
      actions={
        <Button onClick={openCreateModal} variant="gold" className="rounded-xl font-bold shadow-gold text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Add Hero Banner
        </Button>
      }
    >
      <div className="space-y-4">
        {banners && banners.length > 0 ? (
          <div className="grid gap-4">
            {banners.map((b) => (
              <div key={b.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-20 w-36 shrink-0 rounded-2xl overflow-hidden bg-ink border border-border relative">
                      {b.desktop_image_url ? (
                        <SafeImage src={b.desktop_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-ink truncate">
                          {b.heading || "Untitled Banner"}
                        </h3>
                        {b.is_active ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            Disabled
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.subheading}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 font-semibold text-ink">
                          CTA: {b.cta_text} → {b.cta_link}
                        </span>
                        <span>Display Order: #{b.display_order}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(b)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this hero banner?")) {
                          deleteBannerMutation.mutate(b.id);
                        }
                      }}
                      className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
            <Images className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Hero Banners Found</h3>
            <p className="text-xs text-muted-foreground">Add hero slides to display in the main homepage carousel.</p>
            <Button onClick={openCreateModal} variant="gold" className="rounded-xl">
              Create First Hero Banner
            </Button>
          </div>
        )}
      </div>

      {/* Banner Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveBannerMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div>
              <Label className="text-xs">Main Headline *</Label>
              <Input
                required
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Make Every Moment Special"
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Subheading / Description</Label>
              <Input
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="e.g. Everything you need for birthdays, weddings & gifting."
                className="rounded-xl text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Button Text (CTA)</Label>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Shop Now"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Button Link (URL)</Label>
                <Input
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/shop or /category/return-gifts"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Desktop Image URL</Label>
                <Input
                  value={desktopImg}
                  onChange={(e) => setDesktopImg(e.target.value)}
                  placeholder="/assets/hero-1.jpg"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Mobile Image URL</Label>
                <Input
                  value={mobileImg}
                  onChange={(e) => setMobileImg(e.target.value)}
                  placeholder="/assets/hero-1.jpg"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Schedule Start (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Schedule End (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-xl text-xs mt-1"
                />
              </div>
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
                <Switch checked={isActive} onCheckedChange={setIsActive} id="banner-active" />
                <Label htmlFor="banner-active" className="cursor-pointer text-xs font-semibold">
                  Active in Carousel
                </Label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveBannerMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveBannerMutation.isPending ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
