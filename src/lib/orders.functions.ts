import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addressSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  house: z.string().trim().max(120).optional().default(""),
  street: z.string().trim().max(160).optional().default(""),
  area: z.string().trim().max(120).optional().default(""),
  landmark: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
});

const placeOrderSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(["cod", "online"]),
  couponCode: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

/**
 * Places an order. Every price, discount, shipping charge and total is
 * recalculated on the server from the database — values from the browser are
 * never trusted.
 */
export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => placeOrderSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cart, error: cartError } = await supabase
      .from("cart_items")
      .select(
        "id,product_id,variant_id,quantity,products(id,name,price,mrp,moq,stock,track_inventory,allow_backorder,is_published,is_archived,product_images(url,is_primary)),product_variants(id,name,price,mrp,moq,stock,is_active)",
      );
    if (cartError) throw new Error(cartError.message);
    if (!cart || cart.length === 0) throw new Error("Your cart is empty.");

    const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    const shippingCharge = Number(settings?.shipping_charge ?? 0);
    const freeThreshold = Number(settings?.free_shipping_threshold ?? 0);
    if (data.paymentMethod === "cod" && settings && settings.cod_enabled === false) {
      throw new Error("Cash on delivery is currently unavailable.");
    }
    if (data.paymentMethod === "online" && !settings?.online_payment_enabled) {
      throw new Error("Online payment is not enabled yet. Please choose cash on delivery.");
    }

    let subtotal = 0;
    const items: {
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_name: string | null;
      image_url: string | null;
      price: number;
      quantity: number;
      total: number;
    }[] = [];

    for (const row of cart) {
      const product = row.products as unknown as {
        id: string;
        name: string;
        price: number;
        moq: number;
        stock: number;
        track_inventory: boolean;
        allow_backorder: boolean;
        is_published: boolean;
        is_archived: boolean;
        product_images: { url: string; is_primary: boolean }[];
      } | null;
      const variant = row.product_variants as unknown as {
        id: string;
        name: string;
        price: number | null;
        moq: number;
        stock: number;
        is_active: boolean;
      } | null;

      if (!product || !product.is_published || product.is_archived) {
        throw new Error("One of the items in your cart is no longer available.");
      }
      if (row.variant_id && (!variant || !variant.is_active)) {
        throw new Error(`The selected option for ${product.name} is no longer available.`);
      }

      const price = Number(variant?.price ?? product.price);
      const moq = Number(variant?.moq ?? product.moq ?? 1);
      const stock = Number(variant?.stock ?? product.stock ?? 0);
      const qty = Number(row.quantity);

      if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity in cart.");
      if (qty < moq) throw new Error(`Minimum order quantity for ${product.name} is ${moq}.`);
      if (product.track_inventory && !product.allow_backorder && qty > stock) {
        throw new Error(`Only ${stock} left of ${product.name}.`);
      }

      const total = price * qty;
      subtotal += total;
      items.push({
        product_id: product.id,
        variant_id: variant?.id ?? null,
        product_name: product.name,
        variant_name: variant?.name ?? null,
        image_url: product.product_images?.find((i) => i.is_primary)?.url ?? product.product_images?.[0]?.url ?? null,
        price,
        quantity: qty,
        total,
      });
    }

    // coupon validated server-side
    let discount = 0;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const code = data.couponCode.toUpperCase();
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      const nowIso = new Date().toISOString();
      if (
        coupon &&
        (!coupon.starts_at || coupon.starts_at <= nowIso) &&
        (!coupon.ends_at || coupon.ends_at >= nowIso) &&
        subtotal >= Number(coupon.min_cart_value ?? 0) &&
        (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit)
      ) {
        discount =
          coupon.discount_type === "percent"
            ? (subtotal * Number(coupon.discount_value)) / 100
            : Number(coupon.discount_value);
        if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
        discount = Math.min(discount, subtotal);
        couponCode = code;
        await supabase.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);
      } else {
        throw new Error("This coupon code is not valid for your cart.");
      }
    }

    const payable = subtotal - discount;
    const shipping = freeThreshold > 0 && payable >= freeThreshold ? 0 : shippingCharge;
    const total = Math.round((payable + shipping) * 100) / 100;

    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.address.full_name,
        phone: data.address.phone,
        email: profile?.email ?? null,
        address: data.address,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        coupon_code: couponCode,
        shipping,
        tax: 0,
        total,
        payment_method: data.paymentMethod,
        payment_status: data.paymentMethod === "cod" ? "pending" : "pending",
        status: "pending",
        notes: data.notes ?? null,
      })
      .select("id,order_number")
      .single();
    if (orderError) throw new Error(orderError.message);

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (itemsError) throw new Error(itemsError.message);

    // inventory
    for (const item of items) {
      if (item.variant_id) {
        const { data: v } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .maybeSingle();
        if (v) {
          await supabase
            .from("product_variants")
            .update({ stock: Math.max(0, v.stock - item.quantity) })
            .eq("id", item.variant_id);
        }
      }
      const { data: p } = await supabase
        .from("products")
        .select("stock,sold_count,track_inventory")
        .eq("id", item.product_id)
        .maybeSingle();
      if (p) {
        await supabase
          .from("products")
          .update({
            stock: p.track_inventory ? Math.max(0, p.stock - item.quantity) : p.stock,
            sold_count: p.sold_count + item.quantity,
          })
          .eq("id", item.product_id);
      }
    }

    await supabase.from("cart_items").delete().eq("user_id", userId);

    return { orderId: order.id, orderNumber: order.order_number, total };
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ code: z.string().trim().min(1).max(40) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: cart } = await supabase
      .from("cart_items")
      .select("quantity,products(price),product_variants(price)");
    const subtotal = (cart ?? []).reduce((sum, row) => {
      const p = row.products as unknown as { price: number } | null;
      const v = row.product_variants as unknown as { price: number | null } | null;
      return sum + Number(v?.price ?? p?.price ?? 0) * Number(row.quantity);
    }, 0);

    const code = data.code.toUpperCase();
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();
    const nowIso = new Date().toISOString();
    if (
      !coupon ||
      (coupon.starts_at && coupon.starts_at > nowIso) ||
      (coupon.ends_at && coupon.ends_at < nowIso) ||
      (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit)
    ) {
      return { valid: false as const, message: "This coupon code is not valid." };
    }
    if (subtotal < Number(coupon.min_cart_value ?? 0)) {
      return { valid: false as const, message: `Add more items to use this coupon.` };
    }
    let discount =
      coupon.discount_type === "percent"
        ? (subtotal * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);
    if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
    discount = Math.min(discount, subtotal);
    return { valid: true as const, code, discount: Math.round(discount * 100) / 100 };
  });
