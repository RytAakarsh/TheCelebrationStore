import crypto from "node:crypto";

export type PayuEnvironment = "test" | "live";

export interface PayuConfig {
  env: PayuEnvironment;
  merchantKey: string;
  merchantSalt: string;
  clientId?: string;
  clientSecret?: string;
  paymentUrl: string;
  verifyUrl: string;
}

/**
 * Retrieves the active PayU configuration.
 * Salt and private secrets are strictly kept on the server and never returned to the client.
 */
export function getPayuConfig(): PayuConfig {
  const cfEnv = (globalThis as any).__CLOUDFLARE_ENV__;
  const env: PayuEnvironment =
    process.env.PAYU_ENV === "live" || cfEnv?.PAYU_ENV === "live" ? "live" : "test";

  const merchantKey =
    process.env.PAYU_MERCHANT_KEY || cfEnv?.PAYU_MERCHANT_KEY || "bEMOEW";

  const merchantSalt =
    process.env.PAYU_MERCHANT_SALT || cfEnv?.PAYU_MERCHANT_SALT || "3mBPU94YU3fis5VLShZ5F7sO422Ya32E";

  const clientId = process.env.PAYU_CLIENT_ID || cfEnv?.PAYU_CLIENT_ID || undefined;
  const clientSecret = process.env.PAYU_CLIENT_SECRET || cfEnv?.PAYU_CLIENT_SECRET || undefined;

  const isLive = env === "live";

  return {
    env,
    merchantKey,
    merchantSalt,
    clientId,
    clientSecret,
    paymentUrl: isLive
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
    verifyUrl: isLive
      ? "https://info.payu.in/merchant/postservice?form=2"
      : "https://test.payu.in/merchant/postservice?form=2",
  };
}

export interface PayuRequestParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

/**
 * Generates SHA-512 Request Hash according to official PayU India Hosted Checkout spec:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayuRequestHash(
  params: PayuRequestParams,
  salt: string,
): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = params;

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}

export interface PayuResponseData {
  status: string;
  key?: string;
  txnid: string;
  amount: string;
  productinfo?: string;
  firstname?: string;
  email?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
  hash: string;
  mihpayid?: string;
  bank_ref_num?: string;
  bankcode?: string;
  error?: string;
  error_Message?: string;
  mode?: string;
}

/**
 * Verifies reverse SHA-512 Response Hash according to PayU specification:
 * With additionalCharges:
 * sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Without additionalCharges:
 * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayuResponseHash(
  data: PayuResponseData,
  salt: string,
): { valid: boolean; calculated: string; received: string } {
  const {
    additionalCharges,
    status,
    udf5 = "",
    udf4 = "",
    udf3 = "",
    udf2 = "",
    udf1 = "",
    email = "",
    firstname = "",
    productinfo = "",
    amount = "",
    txnid = "",
    key = "",
    hash = "",
  } = data;

  let hashSequence = "";
  if (additionalCharges && String(additionalCharges).trim() !== "") {
    hashSequence = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  const calculated = crypto.createHash("sha512").update(hashSequence).digest("hex").toLowerCase();
  const received = String(hash || "").trim().toLowerCase();

  return {
    valid: calculated === received,
    calculated,
    received,
  };
}

export interface PayuVerificationResult {
  verified: boolean;
  status: "success" | "failure" | "pending" | "not_found";
  amount?: number;
  payuPaymentId?: string;
  bankRefNum?: string;
  mode?: string;
  raw?: Record<string, unknown>;
  error?: string;
}

/**
 * Calls PayU Server-to-Server Verify Payment API (`verify_payment`)
 * Endpoint: https://test.payu.in/merchant/postservice?form=2 (or https://info.payu.in/...)
 * Hash: sha512(key|command|var1|salt)
 */
export async function payuVerifyPaymentApi(
  txnid: string,
): Promise<PayuVerificationResult> {
  const config = getPayuConfig();
  const command = "verify_payment";
  const hashString = `${config.merchantKey}|${command}|${txnid}|${config.merchantSalt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();

  const formData = new URLSearchParams();
  formData.append("key", config.merchantKey);
  formData.append("command", command);
  formData.append("var1", txnid);
  formData.append("hash", hash);

  try {
    const res = await fetch(config.verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      return {
        verified: false,
        status: "pending",
        error: `PayU HTTP status ${res.status}: ${res.statusText}`,
      };
    }

    const json = (await res.json()) as {
      status?: number;
      msg?: string;
      transaction_details?: Record<string, any>;
    };

    if (json.status === 1 && json.transaction_details && json.transaction_details[txnid]) {
      const details = json.transaction_details[txnid];
      const isSuccess = String(details.status).toLowerCase() === "success";
      return {
        verified: isSuccess,
        status: isSuccess ? "success" : "failure",
        amount: Number(details.amount || details.amt || 0),
        payuPaymentId: String(details.mihpayid || ""),
        bankRefNum: String(details.bank_ref_num || ""),
        mode: String(details.mode || ""),
        raw: details,
      };
    }

    // Transaction not found yet or pending
    if (json.transaction_details && json.transaction_details[txnid]?.status === "Not Found") {
      return {
        verified: false,
        status: "not_found",
        error: "Transaction not found on PayU",
      };
    }

    return {
      verified: false,
      status: "pending",
      error: json.msg || "Transaction pending verification",
      raw: json as any,
    };
  } catch (err: any) {
    console.error("[PayU] verify_payment API error:", err);
    return {
      verified: false,
      status: "pending",
      error: err?.message || "Failed to connect to PayU verification server",
    };
  }
}

/**
 * Calls PayU Refund API (`cancel_refund_transaction`)
 * Hash: sha512(key|command|var1|salt)
 */
export async function payuRefundApi(params: {
  mihpayid: string;
  refundToken: string;
  amount: number;
}): Promise<{ success: boolean; msg: string; raw?: unknown }> {
  const config = getPayuConfig();
  const command = "cancel_refund_transaction";
  const { mihpayid, refundToken, amount } = params;

  // Formula for refund: sha512(key|command|var1|salt) where var1 is mihpayid
  const hashString = `${config.merchantKey}|${command}|${mihpayid}|${config.merchantSalt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();

  const formData = new URLSearchParams();
  formData.append("key", config.merchantKey);
  formData.append("command", command);
  formData.append("var1", mihpayid);
  formData.append("var2", refundToken);
  formData.append("var3", amount.toFixed(2));
  formData.append("hash", hash);

  try {
    const res = await fetch(config.verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const json = (await res.json()) as any;
    const isSuccess = json.status === 1 || json.status === "1" || json.msg?.toLowerCase().includes("success");

    return {
      success: Boolean(isSuccess),
      msg: json.msg || (isSuccess ? "Refund initiated successfully" : "Refund rejected by gateway"),
      raw: json,
    };
  } catch (err: any) {
    console.error("[PayU] Refund API error:", err);
    return {
      success: false,
      msg: err.message || "Failed to connect to PayU refund API",
    };
  }
}

/**
 * Returns sanitized gateway configuration status for admin view (no secrets)
 */
export function getSanitizedPayuStatus() {
  const config = getPayuConfig();
  return {
    gatewayName: "PayU India (Hosted Checkout)",
    environment: config.env,
    merchantKey: config.merchantKey,
    isConfigured: Boolean(config.merchantKey && config.merchantSalt),
    hasSalt: Boolean(config.merchantSalt),
    hasClientId: Boolean(config.clientId),
    hasClientSecret: Boolean(config.clientSecret),
    paymentUrl: config.paymentUrl,
    verifyUrl: config.verifyUrl,
  };
}
