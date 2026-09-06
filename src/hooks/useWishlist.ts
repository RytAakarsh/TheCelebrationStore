import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CARD_SELECT, type CardProduct } from "@/lib/queries";
import { useAuth } from "./useAuth";

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const wishlist = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`id,product_id,products(${CARD_SELECT})`)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as { id: string; product_id: string; products: CardProduct | null }[];
    },
  });

  const ids = new Set((wishlist.data ?? []).map((w) => w.product_id));

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Please sign in to save favourites.");
      if (ids.has(productId)) {
        const { error } = await supabase.from("wishlist_items").delete().eq("product_id", productId);
        if (error) throw new Error(error.message);
        return "removed" as const;
      }
      const { error } = await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      if (error) throw new Error(error.message);
      return "added" as const;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(result === "added" ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...wishlist, items: wishlist.data ?? [], ids, toggle };
}
