import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getServiceSupabase } from "./supabase.server";
import {
  getPayuConfig,
  generatePayuRequestHash,
  payuVerifyPaymentApi,
  payuRefundApi,
  getSanitizedPayuStatus,
} from "./payu.server";

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

const initiatePayuSchema = z.object({
  address: addressSchema,
  couponCode: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  origin: z.string().url().optional(),
});

/**
 * Initiates PayU Hosted Checkout.
 * Calculates all prices, stock, discounts, and shipping charges server-side.
 * Generates the official SHA-512 PayU request hash and creates the payment attempt.
 */
export const initiatePayuCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => initiatePayuSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const serviceSupabase = getServiceSupabase();

    // 1. Fetch live cart items from database
    const { data: cart, error: cartError } = await supabase
      .from("cart_items")
      .select(
        "id,product_id,variant_id,quantity,products(id,name,price,mrp,moq,stock,track_inventory,allow_backorder,is_published,is_archived,product_images(url,is_primary)),product_variants(id,name,price,mrp,moq,stock,is_active)",
      );
    if (cartError) throw new Error(cartError.message);
    if (!cart || cart.length === 0) throw new Error("Your cart is empty.");

    // 2. Fetch site settings & verify gateway availability
    const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    const shippingCharge = Number(settings?.shipping_charge ?? 99);
    const freeThreshold = Number(settings?.free_shipping_threshold ?? 999);

    if (settings && settings.online_payment_enabled === false) {
      throw new Error("Online payments are currently disabled. Please choose Cash on Delivery.");
    }

    // 3. Server-side recalculation of subtotal and inventory validation
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
      const product = row.products as any;
      const variant = row.product_variants as any;

      if (!product || !product.is_published || product.is_archived) {
        throw new Error("One or more celebration items in your cart is no longer available.");
      }
      if (row.variant_id && (!variant || !variant.is_active)) {
        throw new Error(`The selected option for ${product.name} is no longer available.`);
      }

      const price = Number(variant?.price ?? product.price);
      const stock = Number(variant?.stock ?? product.stock ?? 0);
      const qty = Number(row.quantity);

      if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity in cart.");
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
        image_url: product.product_images?.find((i: any) => i.is_primary)?.url ?? product.product_images?.[0]?.url ?? null,
        price,
        quantity: qty,
        total,
      });
    }

    // 4. Server-side coupon verification
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
        await serviceSupabase.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);
      } else {
        throw new Error("This coupon code is not valid for your cart.");
      }
    }

    // 5. Final payable total calculation
    const payable = subtotal - discount;
    const effectiveThreshold = freeThreshold > 0 ? freeThreshold : 999;
    const effectiveCharge = shippingCharge > 0 ? shippingCharge : 99;
    const shipping = payable >= effectiveThreshold ? 0 : effectiveCharge;
    const total = Math.round((payable + shipping) * 100) / 100;

    // Fetch user profile for email
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    const customerEmail = profile?.email || "customer@thecelebrationstore.in";

    // 6. Create or retrieve pending order
    const { data: order, error: orderError } = await serviceSupabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.address.full_name,
        phone: data.address.phone,
        email: customerEmail,
        address: data.address,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        coupon_code: couponCode,
        shipping,
        tax: 0,
        total,
        payment_method: "online",
        payment_status: "pending",
        status: "pending",
        notes: data.notes ?? null,
      })
      .select("id,order_number")
      .single();

    if (orderError) throw new Error(orderError.message);

    // Insert order line items
    const { error: itemsError } = await serviceSupabase
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (itemsError) throw new Error(itemsError.message);

    // 7. Generate PayU Hosted Checkout parameters
    const config = getPayuConfig();
    const txnid = `TCS_${order.order_number.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
    const amountStr = total.toFixed(2);
    const productinfo = `The Celebration Store Order ${order.order_number}`.slice(0, 100);
    const firstname = data.address.full_name.split(" ")[0].replace(/[^a-zA-Z]/g, "") || "Customer";

    const baseOrigin = data.origin || process.env.VITE_APP_URL || "https://www.thecelebrationstore.in";
    const surl = `${baseOrigin}/api/payu/return`;
    const furl = `${baseOrigin}/api/payu/return`;

    const requestParams = {
      key: config.merchantKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: customerEmail,
      phone: data.address.phone,
      surl,
      furl,
      udf1: order.id,
      udf2: userId,
      udf3: order.order_number,
      udf4: config.env,
      udf5: "thecelebrationstore",
    };

    // Calculate SHA-512 payment hash
    const hash = generatePayuRequestHash(requestParams, config.merchantSalt);

    // Record initial payment attempt in database
    try {
      await serviceSupabase.from("payment_attempts").insert({
        order_id: order.id,
        user_id: userId,
        txnid,
        amount: total,
        currency: "INR",
        environment: config.env,
        status: "initiated",
        raw_response: { requestParams },
      });
    } catch (e) {
      console.warn("[PayU] Could not insert into payment_attempts table:", e);
    }

    // Update order with txnid reference
    await serviceSupabase.from("orders").update({ payment_ref: txnid }).eq("id", order.id);

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      actionUrl: config.paymentUrl,
      payuParams: {
        ...requestParams,
        hash,
        service_provider: "payu_paisa",
      },
    };
  });

/**
 * Re-initiates payment for an existing unpaid order without creating duplicate orders.
 */
export const retryPayuPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z.object({ orderId: z.string().uuid(), origin: z.string().url().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const serviceSupabase = getServiceSupabase();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .single();

    if (orderErr || !order) throw new Error("Order not found or unauthorized.");
    if (order.payment_status === "paid") throw new Error("This order is already paid.");

    const config = getPayuConfig();
    const txnid = `TCS_${order.order_number.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
    const amountStr = Number(order.total).toFixed(2);
    const productinfo = `The Celebration Store Order ${order.order_number}`.slice(0, 100);
    const firstname = (order.customer_name || "Customer").split(" ")[0].replace(/[^a-zA-Z]/g, "") || "Customer";
    const email = order.email || "customer@thecelebrationstore.in";
    const phone = order.phone || "9999999999";

    const baseOrigin = data.origin || process.env.VITE_APP_URL || "https://www.thecelebrationstore.in";
    const surl = `${baseOrigin}/api/payu/return`;
    const furl = `${baseOrigin}/api/payu/return`;

    const requestParams = {
      key: config.merchantKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      udf1: order.id,
      udf2: userId,
      udf3: order.order_number,
      udf4: config.env,
      udf5: "thecelebrationstore",
    };

    const hash = generatePayuRequestHash(requestParams, config.merchantSalt);

    try {
      await serviceSupabase.from("payment_attempts").insert({
        order_id: order.id,
        user_id: userId,
        txnid,
        amount: Number(order.total),
        currency: "INR",
        environment: config.env,
        status: "initiated",
        raw_response: { requestParams, isRetry: true },
      });
    } catch {}

    await serviceSupabase.from("orders").update({ payment_ref: txnid }).eq("id", order.id);

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      total: Number(order.total),
      actionUrl: config.paymentUrl,
      payuParams: {
        ...requestParams,
        hash,
        service_provider: "payu_paisa",
      },
    };
  });

/**
 * Checks verified payment result for customer confirmation screen.
 */
export const getPaymentResultStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z.object({ orderId: z.string().uuid().optional(), txnid: z.string().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let query = supabase.from("orders").select("*,order_items(*)").eq("user_id", userId);
    if (data.orderId) {
      query = query.eq("id", data.orderId);
    } else if (data.txnid) {
      query = query.eq("payment_ref", data.txnid);
    } else {
      throw new Error("Missing orderId or txnid");
    }

    const { data: order, error } = await query.maybeSingle();
    if (error || !order) return { found: false as const };

    return {
      found: true as const,
      order,
      isPaid: order.payment_status === "paid",
    };
  });

/**
 * Admin: Get paginated payment transactions with search & filters.
 */
export const getAdminPaymentTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(5).max(100).default(20),
        status: z.string().optional(),
        environment: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify admin
    const { data: isAdmin } = await (supabase.rpc as any)("is_admin");
    const isStoreAdmin = context.claims?.email === "thecelebrationstore@gmail.com";
    if (!isAdmin && !isStoreAdmin) throw new Error("Unauthorized: Admin privileges required.");

    const serviceSupabase = getServiceSupabase();

    // Try fetching from payment_attempts; if table not yet migrated, fallback to orders
    try {
      let query = serviceSupabase
        .from("payment_attempts")
        .select("*,orders(order_number,customer_name,phone,email)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (data.status && data.status !== "all") {
        query = query.eq("status", data.status);
      }
      if (data.environment && data.environment !== "all") {
        query = query.eq("environment", data.environment);
      }
      if (data.search) {
        query = query.or(`txnid.ilike.%${data.search}%,payu_payment_id.ilike.%${data.search}%`);
      }

      const offset = (data.page - 1) * data.limit;
      query = query.range(offset, offset + data.limit - 1);

      const { data: attempts, count, error } = await query;
      if (!error && attempts) {
        return {
          transactions: attempts,
          totalCount: count ?? attempts.length,
          page: data.page,
          totalPages: Math.ceil((count ?? attempts.length) / data.limit),
          source: "payment_attempts" as const,
        };
      }
    } catch {}

    // Fallback query to orders table
    let orderQuery = serviceSupabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("payment_method", "online")
      .order("created_at", { ascending: false });

    if (data.status && data.status !== "all") {
      orderQuery = orderQuery.eq("payment_status", data.status);
    }
    if (data.search) {
      orderQuery = orderQuery.or(`order_number.ilike.%${data.search}%,payment_ref.ilike.%${data.search}%`);
    }

    const offset = (data.page - 1) * data.limit;
    orderQuery = orderQuery.range(offset, offset + data.limit - 1);

    const { data: orders, count } = await orderQuery;

    const mapped = (orders ?? []).map((o: any) => ({
      id: o.id,
      order_id: o.id,
      user_id: o.user_id,
      txnid: o.payment_ref || `TCS_${o.order_number}`,
      payu_payment_id: o.payment_ref,
      amount: o.total,
      currency: "INR",
      environment: "test",
      status: o.payment_status === "paid" ? "success" : o.payment_status === "failed" ? "failed" : "pending",
      created_at: o.created_at,
      orders: {
        order_number: o.order_number,
        customer_name: o.customer_name,
        phone: o.phone,
        email: o.email,
      },
    }));

    return {
      transactions: mapped,
      totalCount: count ?? mapped.length,
      page: data.page,
      totalPages: Math.ceil((count ?? mapped.length) / data.limit),
      source: "orders_fallback" as const,
    };
  });

/**
 * Admin: Get payment gateway configuration & test verification status.
 */
export const getAdminPaymentSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await (supabase.rpc as any)("is_admin");
    const isStoreAdmin = context.claims?.email === "thecelebrationstore@gmail.com";
    if (!isAdmin && !isStoreAdmin) throw new Error("Unauthorized: Admin privileges required.");

    const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    const sanitized = getSanitizedPayuStatus();

    return {
      settings: {
        online_payment_enabled: settings?.online_payment_enabled ?? true,
        cod_enabled: settings?.cod_enabled ?? true,
        payu_enabled: (settings as any)?.payu_enabled ?? true,
        payu_env: (settings as any)?.payu_env || sanitized.environment,
      },
      gateway: sanitized,
      returnUrl: `${process.env.VITE_APP_URL || "https://www.thecelebrationstore.in"}/api/payu/return`,
      webhookUrl: `${process.env.VITE_APP_URL || "https://www.thecelebrationstore.in"}/api/payu/webhook`,
    };
  });

/**
 * Admin: Reconcile transaction with PayU verify_payment API.
 */
export const adminReconcileTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ txnid: z.string().min(3) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await (supabase.rpc as any)("is_admin");
    const isStoreAdmin = context.claims?.email === "thecelebrationstore@gmail.com";
    if (!isAdmin && !isStoreAdmin) throw new Error("Unauthorized: Admin privileges required.");

    const result = await payuVerifyPaymentApi(data.txnid);
    const serviceSupabase = getServiceSupabase();

    if (result.verified && result.status === "success") {
      await serviceSupabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          payment_ref: result.payuPaymentId || data.txnid,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_ref", data.txnid);

      try {
        await serviceSupabase
          .from("payment_attempts")
          .update({
            status: "success",
            payu_payment_id: result.payuPaymentId,
            verified_at: new Date().toISOString(),
            raw_response: result.raw,
            updated_at: new Date().toISOString(),
          })
          .eq("txnid", data.txnid);
      } catch {}
    }

    return result;
  });

/**
 * Admin: Initiate PayU Refund.
 */
export const adminRefundPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        mihpayid: z.string().min(1),
        amount: z.number().positive(),
        reason: z.string().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await (supabase.rpc as any)("is_admin");
    const isStoreAdmin = context.claims?.email === "thecelebrationstore@gmail.com";
    if (!isAdmin && !isStoreAdmin) throw new Error("Unauthorized: Admin privileges required.");

    const serviceSupabase = getServiceSupabase();
    const { data: order } = await serviceSupabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();

    if (!order) throw new Error("Order not found.");
    if (order.payment_status !== "paid") throw new Error("Only fully paid orders can be refunded.");
    if (data.amount > Number(order.total)) throw new Error("Refund amount cannot exceed captured total.");

    const refundToken = `REF_${Date.now()}`;
    const result = await payuRefundApi({
      mihpayid: data.mihpayid,
      refundToken,
      amount: data.amount,
    });

    if (result.success) {
      await serviceSupabase
        .from("orders")
        .update({
          payment_status: "refunded",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.orderId);

      try {
        await serviceSupabase
          .from("payment_attempts")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", data.orderId);
      } catch {}

      try {
        await serviceSupabase.from("payment_events").insert({
          order_id: data.orderId,
          event_type: "admin_refund",
          source: "admin_portal",
          status: "success",
          metadata: {
            mihpayid: data.mihpayid,
            refundToken,
            amount: data.amount,
            reason: data.reason,
          },
        });
      } catch {}
    }

    return result;
  });
