import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CartRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    moq: number;
    stock: number;
    product_images: { url: string; is_primary: boolean; position: number }[];
  } | null;
  product_variants: {
    id: string;
    name: string;
    color_hex: string | null;
    price: number | null;
    mrp: number | null;
    stock: number;
    moq: number;
  } | null;
};

export function cartLinePrice(row: CartRow) {
  return Number(row.product_variants?.price ?? row.products?.price ?? 0);
}
export function cartLineMrp(row: CartRow) {
  return Number(row.product_variants?.mrp ?? row.products?.mrp ?? 0);
}
export function cartLineMoq(row: CartRow) {
  return Number(row.product_variants?.moq ?? row.products?.moq ?? 1);
}
export function cartLineStock(row: CartRow) {
  return Number(row.product_variants?.stock ?? row.products?.stock ?? 0);
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const cart = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id,product_id,variant_id,quantity,products(id,name,slug,price,mrp,moq,stock,product_images(url,is_primary,position)),product_variants(id,name,color_hex,price,mrp,stock,moq)",
        )
        .order("created_at");
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as CartRow[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });

  const add = useMutation({
    mutationFn: async (input: { productId: string; variantId?: string | null; quantity: number }) => {
      if (!user) throw new Error("Please sign in to add items to your cart.");
      let existingQuery = supabase
        .from("cart_items")
        .select("id,quantity")
        .eq("product_id", input.productId);
      existingQuery = input.variantId
        ? existingQuery.eq("variant_id", input.variantId)
        : existingQuery.is("variant_id", null);
      const { data: existing } = await existingQuery.maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + input.quantity })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: input.productId,
          variant_id: input.variantId ?? null,
          quantity: input.quantity,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Added to cart");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Removed from cart");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = cart.data ?? [];
  const subtotal = items.reduce((sum, r) => sum + cartLinePrice(r) * r.quantity, 0);
  const mrpTotal = items.reduce((sum, r) => sum + cartLineMrp(r) * r.quantity, 0);
  const count = items.reduce((sum, r) => sum + r.quantity, 0);

  return { ...cart, items, subtotal, mrpTotal, count, add, setQuantity, remove };
}
