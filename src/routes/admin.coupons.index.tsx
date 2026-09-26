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
import { Plus, Edit2, Trash2, Ticket, Calendar, Check, Copy } from "lucide-react";
import { inr, formatDateIST } from "@/lib/format";

export const Route = createFileRoute("/admin/coupons/")({
  component: AdminCouponsPage,
});

type CouponRecord = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_cart_value: number;
  max_discount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

function AdminCouponsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [minCartValue, setMinCartValue] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as CouponRecord[];
    },
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("CELEBRATE10");
    setDiscountType("percent");
    setDiscountValue(10);
    setMinCartValue(499);
    setMaxDiscount(200);
    setStartsAt(new Date().toISOString().slice(0, 16));
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 60);
    setEndsAt(nextMonth.toISOString().slice(0, 16));
    setUsageLimit(500);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditModal = (c: CouponRecord) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType((c.discount_type as any) || "percent");
    setDiscountValue(Number(c.discount_value) || 0);
    setMinCartValue(Number(c.min_cart_value) || 0);
    setMaxDiscount(c.max_discount != null ? Number(c.max_discount) : "");
    setStartsAt(c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : "");
    setEndsAt(c.ends_at ? new Date(c.ends_at).toISOString().slice(0, 16) : "");
    setUsageLimit(c.usage_limit != null ? Number(c.usage_limit) : "");
    setIsActive(c.is_active);
    setDialogOpen(true);
  };

  // Save Mutation
  const saveCouponMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        min_cart_value: Number(minCartValue) || 0,
        max_discount: maxDiscount !== "" ? Number(maxDiscount) : null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        usage_limit: usageLimit !== "" ? Number(usageLimit) : null,
        is_active: isActive,
      };

      if (editingCoupon) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", editingCoupon.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      setDialogOpen(false);
      toast.success(editingCoupon ? "Coupon updated!" : "Coupon created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save coupon");
    },
  });

  // Delete Mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon deleted.");
    },
  });

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Coupons & Promo Codes"
      description="Manage discount promo codes, usage limits, minimum order values and validity periods"
      actions={
        <Button onClick={openCreateModal} variant="gold" className="rounded-xl font-bold shadow-gold text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Create Coupon Code
        </Button>
      }
    >
      <div className="space-y-4">
        {coupons && coupons.length > 0 ? (
          <div className="grid gap-4">
            {coupons.map((coupon) => {
              const now = new Date();
              const isExpired = coupon.ends_at && new Date(coupon.ends_at) < now;
              const isLimitReached = coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit;

              return (
                <div key={coupon.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink/15 text-pink">
                        <Ticket className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-base font-bold tracking-wider text-ink bg-secondary px-3 py-1 rounded-xl">
                            {coupon.code}
                          </span>
                          <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-ink">
                            {coupon.discount_type === "percent" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                          </span>
                          {isExpired ? (
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                              Expired
                            </span>
                          ) : isLimitReached ? (
                            <span className="rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-bold text-orange">
                              Limit Reached
                            </span>
                          ) : coupon.is_active ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Disabled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Min Cart Value: <strong>{inr(coupon.min_cart_value)}</strong></span>
                          {coupon.max_discount && <span>Max Cap: <strong>{inr(coupon.max_discount)}</strong></span>}
                          <span>Used: <strong>{coupon.used_count}</strong> {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "times"}</span>
                          {coupon.ends_at && <span>Expires: {formatDateIST(coupon.ends_at)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code);
                          toast.success(`Coupon code ${coupon.code} copied!`);
                        }}
                        className="rounded-xl text-xs text-muted-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(coupon)}
                        className="rounded-xl text-xs font-semibold"
                      >
                        <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete coupon "${coupon.code}"?`)) {
                            deleteCouponMutation.mutate(coupon.id);
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
            <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Coupon Codes Found</h3>
            <p className="text-xs text-muted-foreground">Create discount codes for festive campaigns and customer rewards.</p>
            <Button onClick={openCreateModal} variant="gold" className="rounded-xl">
              Create First Coupon
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingCoupon ? "Edit Coupon Code" : "Create Celebration Coupon"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim()) {
                toast.error("Coupon code is required");
                return;
              }
              saveCouponMutation.mutate();
            }}
            className="space-y-4 pt-3"
          >
            <div>
              <Label className="text-xs">Coupon Code *</Label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CELEBRATE10"
                className="rounded-xl font-mono text-xs uppercase mt-1"
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
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Flat Fixed (₹)</option>
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
                <Label className="text-xs">Min Cart Value (₹)</Label>
                <Input
                  type="number"
                  value={minCartValue}
                  onChange={(e) => setMinCartValue(Number(e.target.value))}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Max Discount Cap (₹)</Label>
                <Input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Optional cap"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valid From</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Valid Until</Label>
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
                <Label className="text-xs">Usage Limit (Count)</Label>
                <Input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Unlimited if empty"
                  className="rounded-xl text-xs mt-1"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="coupon-active" />
                <Label htmlFor="coupon-active" className="cursor-pointer text-xs font-semibold">
                  Active in Checkout
                </Label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveCouponMutation.isPending}
                className="rounded-xl bg-gold text-ink font-bold hover:bg-gold-premium text-xs"
              >
                {saveCouponMutation.isPending ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
