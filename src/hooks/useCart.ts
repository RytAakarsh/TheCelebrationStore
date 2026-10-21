import { useEffect } from "react";
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

export type GuestCartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

const GUEST_CART_KEY = "tcs_guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is GuestCartItem =>
          typeof item?.productId === "string" && typeof item?.quantity === "number" && item.quantity > 0,
      );
    }
  } catch {
    // ignore corrupted storage
  }
  return [];
}

export function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

export function cartLinePrice(row: CartRow) {
  return Number(row.product_variants?.price ?? row.products?.price ?? 0);
}
export function cartLineMrp(row: CartRow) {
  return Number(row.product_variants?.mrp ?? row.products?.mrp ?? 0);
}
export function cartLineMoq(row: CartRow) {
  // Customer-facing MOQ eliminated: allow ordering 1 or more pieces of any product
  return 1;
}
export function cartLineStock(row: CartRow) {
  return Number(row.product_variants?.stock ?? row.products?.stock ?? 0);
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const cart = useQuery({
    queryKey: ["cart", user ? user.id : "guest"],
    queryFn: async () => {
      if (user) {
        // Authenticated user: fetch from database
        const { data, error } = await supabase
          .from("cart_items")
          .select(
            "id,product_id,variant_id,quantity,products(id,name,slug,price,mrp,moq,stock,product_images(url,is_primary,position)),product_variants(id,name,color_hex,price,mrp,stock,moq)",
          )
          .order("created_at");
        if (error) throw new Error(error.message);
        return (data ?? []) as unknown as CartRow[];
      }

      // Guest user: fetch from localStorage and hydrate product details
      const guestItems = getGuestCart();
      if (guestItems.length === 0) return [] as CartRow[];

      const productIds = Array.from(new Set(guestItems.map((i) => i.productId)));
      const variantIds = Array.from(
        new Set(guestItems.map((i) => i.variantId).filter((v): v is string => Boolean(v))),
      );

      const [prodsRes, varsRes] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,slug,price,mrp,moq,stock,product_images(url,is_primary,position)")
          .in("id", productIds)
          .eq("is_published", true)
          .eq("is_archived", false),
        variantIds.length > 0
          ? supabase
              .from("product_variants")
              .select("id,name,color_hex,price,mrp,stock,moq")
              .in("id", variantIds)
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      const prodsMap = new Map((prodsRes.data ?? []).map((p) => [p.id, p]));
      const varsMap = new Map((varsRes.data ?? []).map((v) => [v.id, v]));

      const rows: CartRow[] = [];
      for (const item of guestItems) {
        const product = prodsMap.get(item.productId);
        if (!product) continue; // Skip unavailable/deleted products gracefully
        const variant = item.variantId ? varsMap.get(item.variantId) ?? null : null;
        rows.push({
          id: `guest_${item.productId}_${item.variantId ?? "default"}`,
          product_id: item.productId,
          variant_id: item.variantId ?? null,
          quantity: item.quantity,
          products: product as any,
          product_variants: variant as any,
        });
      }
      return rows;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });

  // Merge guest cart into database cart when user logs in
  useEffect(() => {
    if (!user) return;
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    let isMounted = true;
    (async () => {
      try {
        for (const item of guestItems) {
          let existingQuery = supabase
            .from("cart_items")
            .select("id,quantity")
            .eq("product_id", item.productId)
            .eq("user_id", user.id);
          existingQuery = item.variantId
            ? existingQuery.eq("variant_id", item.variantId)
            : existingQuery.is("variant_id", null);

          const { data: existing } = await existingQuery.maybeSingle();
          if (existing) {
            await supabase
              .from("cart_items")
              .update({ quantity: existing.quantity + item.quantity })
              .eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({
              user_id: user.id,
              product_id: item.productId,
              variant_id: item.variantId ?? null,
              quantity: item.quantity,
            });
          }
        }
        clearGuestCart();
        if (isMounted) {
          qc.invalidateQueries({ queryKey: ["cart"] });
        }
      } catch (err) {
        console.error("Failed to merge guest cart:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, qc]);

  const add = useMutation({
    mutationFn: async (input: { productId: string; variantId?: string | null; quantity: number }) => {
      const qty = Math.max(1, Number(input.quantity) || 1);

      if (!user) {
        // Guest user
        const guestItems = getGuestCart();
        const existingIndex = guestItems.findIndex(
          (i) => i.productId === input.productId && (i.variantId ?? null) === (input.variantId ?? null),
        );
        if (existingIndex >= 0) {
          guestItems[existingIndex].quantity += qty;
        } else {
          guestItems.push({
            productId: input.productId,
            variantId: input.variantId ?? null,
            quantity: qty,
          });
        }
        saveGuestCart(guestItems);
        return;
      }

      // Authenticated user
      let existingQuery = supabase
        .from("cart_items")
        .select("id,quantity")
        .eq("product_id", input.productId)
        .eq("user_id", user.id);
      existingQuery = input.variantId
        ? existingQuery.eq("variant_id", input.variantId)
        : existingQuery.is("variant_id", null);
      const { data: existing } = await existingQuery.maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: input.productId,
          variant_id: input.variantId ?? null,
          quantity: qty,
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
      const qty = Math.max(1, quantity);
      if (!user || id.startsWith("guest_")) {
        const guestItems = getGuestCart();
        const updated = guestItems.map((item) => {
          const guestId = `guest_${item.productId}_${item.variantId ?? "default"}`;
          return guestId === id ? { ...item, quantity: qty } : item;
        });
        saveGuestCart(updated);
        return;
      }
      const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!user || id.startsWith("guest_")) {
        const guestItems = getGuestCart();
        const filtered = guestItems.filter((item) => {
          const guestId = `guest_${item.productId}_${item.variantId ?? "default"}`;
          return guestId !== id;
        });
        saveGuestCart(filtered);
        return;
      }
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
