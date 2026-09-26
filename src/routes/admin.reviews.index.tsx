import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StarRating } from "@/components/shop/StarRating";
import { Star, CheckCircle, EyeOff, Trash2, MessageSquare, ShieldCheck, Check } from "lucide-react";
import { formatDateIST } from "@/lib/format";

export const Route = createFileRoute("/admin/reviews/")({
  component: AdminReviewsPage,
});

type ReviewItem = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
  product_name?: string;
};

function AdminReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const [reviewsRes, productsRes] = await Promise.all([
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name"),
      ]);

      if (reviewsRes.error) throw new Error(reviewsRes.error.message);
      const prodMap = new Map((productsRes.data ?? []).map((p) => [p.id, p.name]));

      return (reviewsRes.data ?? []).map((r) => ({
        ...r,
        product_name: prodMap.get(r.product_id) || "Celebration Product",
      })) as ReviewItem[];
    },
  });

  // Toggle approval mutation
  const toggleApprovalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { approved }) => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(approved ? "Review approved and published!" : "Review hidden from storefront.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update review status");
    },
  });

  // Delete mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted.");
    },
  });

  if (isLoading) return <AdminLoading />;

  const filtered = (reviews ?? []).filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pendingCount = (reviews ?? []).filter((r) => !r.is_approved).length;
  const approvedCount = (reviews ?? []).filter((r) => r.is_approved).length;
  const avgRating = (reviews ?? []).length
    ? (reviews ?? []).reduce((sum, r) => sum + Number(r.rating || 0), 0) / (reviews?.length || 1)
    : 5.0;

  return (
    <AdminPage
      title="Customer Reviews & Ratings"
      description="Moderate verified customer testimonials, star ratings and product feedback"
    >
      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Reviews</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">{reviews?.length ?? 0}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Average Store Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-display text-2xl font-bold text-gold">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 5.0 ⭐</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Published Reviews</p>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Moderation</p>
          <p className="font-display text-2xl font-bold text-pink mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-2xl bg-secondary/60 p-1 w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            filter === "all" ? "bg-card text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
          }`}
        >
          All Reviews ({reviews?.length ?? 0})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            filter === "pending" ? "bg-pink text-white shadow-sm" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            filter === "approved" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Published ({approvedCount})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((rev) => (
            <div key={rev.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-ink text-sm">{rev.product_name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <StarRating value={rev.rating} count={0} />
                    <span>• {formatDateIST(rev.created_at)}</span>
                    <span className="text-[10px] text-muted-foreground">User: {rev.user_id.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rev.is_approved ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Approved &amp; Live
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1 text-xs">
                {rev.title && <h4 className="font-bold text-ink text-sm">{rev.title}</h4>}
                <p className="text-muted-foreground leading-relaxed">
                  {rev.body || "No detailed review comment provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                {rev.is_approved ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleApprovalMutation.mutate({ id: rev.id, approved: false })}
                    className="rounded-xl text-xs"
                  >
                    <EyeOff className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Hide from Store
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => toggleApprovalMutation.mutate({ id: rev.id, approved: true })}
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Approve &amp; Publish
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this customer review permanently?")) {
                      deleteReviewMutation.mutate(rev.id);
                    }
                  }}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No Customer Reviews Found</h3>
            <p className="text-xs text-muted-foreground">Verified buyer product reviews will appear here for moderation.</p>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
