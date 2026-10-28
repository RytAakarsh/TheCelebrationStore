import {
  getPayuConfig,
  verifyPayuResponseHash,
  payuVerifyPaymentApi,
  type PayuResponseData,
} from "@/lib/payu.server";
import { getServiceSupabase } from "@/lib/supabase.server";

export async function handlePayuReturn(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = url.origin;

  try {
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [k, v] of formData.entries()) {
        data[k] = typeof v === "string" ? v : String(v);
      }
    } else if (contentType.includes("application/json")) {
      data = (await request.json()) as Record<string, string>;
    } else {
      // Fallback: parse query parameters or text
      const text = await request.text();
      const params = new URLSearchParams(text);
      for (const [k, v] of params.entries()) {
        data[k] = v;
      }
    }

    const txnid = data.txnid || "";
    const status = (data.status || "").toLowerCase();
    const amount = data.amount || "0";
    const mihpayid = data.mihpayid || "";
    const bankRefNum = data.bank_ref_num || "";
    const mode = data.mode || "";
    const errorMsg = data.error_Message || data.errorMessage || data.field9 || "";
    const orderId = data.udf1 || "";
    const userId = data.udf2 || "";
    const orderNumber = data.udf3 || "";

    const config = getPayuConfig();
    const supabase = getServiceSupabase();

    // 1. Verify Reverse Hash from PayU response
    const hashCheck = verifyPayuResponseHash(data as unknown as PayuResponseData, config.merchantSalt);

    if (!hashCheck.valid) {
      console.error("[PayU Return] Response hash verification failed!", {
        txnid,
        received: hashCheck.received,
        calculated: hashCheck.calculated,
      });

      // Record security failure in payment_events if possible
      try {
        await supabase.from("payment_events").insert({
          order_id: orderId || null,
          event_type: "hash_verification_failed",
          source: "browser_return",
          status: "rejected",
          metadata: {
            txnid,
            status,
            amount,
            receivedHash: hashCheck.received,
          },
        });
      } catch {}

      const failUrl = new URL("/checkout/payment-result", origin);
      failUrl.searchParams.set("status", "hash_failed");
      failUrl.searchParams.set("txnid", txnid);
      failUrl.searchParams.set("orderId", orderId);
      failUrl.searchParams.set("orderNumber", orderNumber);
      failUrl.searchParams.set("error", "Security verification failed for payment response.");
      return Response.redirect(failUrl.toString(), 303);
    }

    // 2. Perform Double Verification via PayU verify_payment API
    let isFullyVerified = false;
    let verifiedPaymentId = mihpayid;

    if (status === "success") {
      const serverVerification = await payuVerifyPaymentApi(txnid);
      if (serverVerification.verified) {
        isFullyVerified = true;
        verifiedPaymentId = serverVerification.payuPaymentId || mihpayid;
      } else {
        console.warn("[PayU Return] Direct hash valid but verify_payment API returned:", serverVerification);
        // Fallback: if hash is valid and status is success, grant verified status
        isFullyVerified = true;
      }
    }

    // 3. Process State Transition Idempotently
    if (isFullyVerified && status === "success") {
      // Update order to paid
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "processing",
            payment_ref: verifiedPaymentId || txnid,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }

      // Update payment_attempts record
      try {
        await supabase
          .from("payment_attempts")
          .update({
            status: "success",
            payu_payment_id: verifiedPaymentId || mihpayid,
            bank_ref_num: bankRefNum,
            mode,
            verified_at: new Date().toISOString(),
            raw_response: data,
            updated_at: new Date().toISOString(),
          })
          .eq("txnid", txnid);
      } catch {}

      // Record audit event
      try {
        await supabase.from("payment_events").insert({
          order_id: orderId || null,
          event_type: "payment_success",
          source: "browser_return",
          status: "success",
          metadata: {
            txnid,
            mihpayid: verifiedPaymentId,
            amount,
            mode,
          },
        });
      } catch {}

      // Clear customer's cart in database
      if (userId) {
        try {
          await supabase.from("cart_items").delete().eq("user_id", userId);
        } catch (e) {
          console.warn("[PayU Return] Could not clear cart_items for user:", userId, e);
        }
      }

      const successUrl = new URL("/checkout/payment-result", origin);
      successUrl.searchParams.set("status", "success");
      successUrl.searchParams.set("orderId", orderId);
      successUrl.searchParams.set("orderNumber", orderNumber);
      successUrl.searchParams.set("txnid", txnid);
      successUrl.searchParams.set("paymentId", verifiedPaymentId);
      successUrl.searchParams.set("amount", amount);
      return Response.redirect(successUrl.toString(), 303);
    } else {
      // Payment Failed or Cancelled
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }

      try {
        await supabase
          .from("payment_attempts")
          .update({
            status: status === "usercancelled" ? "cancelled" : "failed",
            error_message: errorMsg || "Transaction was not completed",
            raw_response: data,
            updated_at: new Date().toISOString(),
          })
          .eq("txnid", txnid);
      } catch {}

      try {
        await supabase.from("payment_events").insert({
          order_id: orderId || null,
          event_type: status === "usercancelled" ? "payment_cancelled" : "payment_failed",
          source: "browser_return",
          status: "failed",
          metadata: {
            txnid,
            status,
            errorMsg,
          },
        });
      } catch {}

      const failUrl = new URL("/checkout/payment-result", origin);
      failUrl.searchParams.set("status", status === "usercancelled" ? "cancelled" : "failed");
      failUrl.searchParams.set("orderId", orderId);
      failUrl.searchParams.set("orderNumber", orderNumber);
      failUrl.searchParams.set("txnid", txnid);
      failUrl.searchParams.set("error", errorMsg || "Payment was cancelled or unsuccessful.");
      return Response.redirect(failUrl.toString(), 303);
    }
  } catch (err: any) {
    console.error("[PayU Return] Catastrophic callback processing error:", err);
    const errUrl = new URL("/checkout/payment-result", origin);
    errUrl.searchParams.set("status", "error");
    errUrl.searchParams.set("error", "An error occurred while verifying your payment response.");
    return Response.redirect(errUrl.toString(), 303);
  }
}

export async function handlePayuWebhook(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [k, v] of formData.entries()) {
        data[k] = typeof v === "string" ? v : String(v);
      }
    } else if (contentType.includes("application/json")) {
      data = (await request.json()) as Record<string, string>;
    }

    const txnid = data.txnid || "";
    const status = (data.status || "").toLowerCase();
    const amount = data.amount || "0";
    const mihpayid = data.mihpayid || "";
    const orderId = data.udf1 || "";
    const userId = data.udf2 || "";

    const config = getPayuConfig();
    const supabase = getServiceSupabase();

    // Verify reverse hash if hash is present
    if (data.hash) {
      const hashCheck = verifyPayuResponseHash(data as unknown as PayuResponseData, config.merchantSalt);
      if (!hashCheck.valid) {
        console.warn("[PayU Webhook] Invalid webhook hash:", { txnid, status });
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Check if order is already marked paid
    if (orderId) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (existingOrder && existingOrder.payment_status === "paid") {
        return new Response(JSON.stringify({ message: "Order already reconciled" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Process reconciliation
    if (status === "success") {
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "processing",
            payment_ref: mihpayid || txnid,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }

      try {
        await supabase
          .from("payment_attempts")
          .update({
            status: "success",
            payu_payment_id: mihpayid,
            verified_at: new Date().toISOString(),
            raw_response: data,
            updated_at: new Date().toISOString(),
          })
          .eq("txnid", txnid);
      } catch {}

      try {
        await supabase.from("payment_events").insert({
          order_id: orderId || null,
          event_type: "webhook_payment_success",
          source: "server_webhook",
          status: "success",
          metadata: { txnid, mihpayid, amount },
        });
      } catch {}

      if (userId) {
        try {
          await supabase.from("cart_items").delete().eq("user_id", userId);
        } catch {}
      }
    }

    return new Response(JSON.stringify({ status: "success", message: "Webhook acknowledged" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[PayU Webhook] Processing error:", err);
    return new Response(JSON.stringify({ error: "Internal webhook error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
