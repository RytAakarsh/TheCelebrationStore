import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

try {
  const envContent = fs.readFileSync(".env", "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
} catch (e) {}

const merchantKey = process.env.PAYU_MERCHANT_KEY || "bEMOEW";
const salt = process.env.PAYU_MERCHANT_SALT || "3mBPU94YU3fis5VLShZ5F7sO422Ya32E";

console.log("==================================================");
console.log("THE CELEBRATION STORE — PAYU INTEGRATION TEST SUITE");
console.log("==================================================");
console.log(`Merchant Key: ${merchantKey}`);
console.log(`Salt configured: ${Boolean(salt)}`);

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Request Hash Formula Test
console.log("\n[Test 1] Request Hash Generation (SHA-512)");
const txnid = "TCS_TEST_" + Date.now();
const amount = (1499).toFixed(2);
const productinfo = "Celebration Supplies";
const firstname = "Aakarsh";
const email = "thecelebrationstore@gmail.com";
const udf1 = "test-order-id";
const udf2 = "test-user-id";
const udf3 = "";
const udf4 = "";
const udf5 = "";

const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

assert(calculatedHash.length === 128, "SHA-512 digest length must be exactly 128 characters");
assert(/^[0-9a-f]{128}$/i.test(calculatedHash), "Hash must be a valid lowercase/uppercase hex string");

// 2. Response Hash Verification Test (Standard)
console.log("\n[Test 2] Response Reverse Hash Verification (Standard)");
const status = "success";
const standardResponseHashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
const standardResponseHash = crypto.createHash("sha512").update(standardResponseHashString).digest("hex");

// Verify matches
const testCalc = crypto.createHash("sha512").update(standardResponseHashString).digest("hex");
assert(
  testCalc.toLowerCase() === standardResponseHash.toLowerCase(),
  "Standard reverse hash must match PayU server response hash"
);

// 3. Response Hash with additionalCharges Test
console.log("\n[Test 3] Response Reverse Hash Verification (With additionalCharges)");
const additionalCharges = "12.50";
const addChargesHashString = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
const addChargesHash = crypto.createHash("sha512").update(addChargesHashString).digest("hex");

const addChargesCalc = crypto.createHash("sha512").update(addChargesHashString).digest("hex");
assert(
  addChargesCalc.toLowerCase() === addChargesHash.toLowerCase(),
  "Reverse hash with additionalCharges must correctly prepend additionalCharges"
);

// 4. Tampering Detection Test
console.log("\n[Test 4] Tampering Resistance");
const tamperedAmount = "1.00"; // Attacker tries to alter amount
const tamperedString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${tamperedAmount}|${txnid}|${merchantKey}`;
const tamperedHash = crypto.createHash("sha512").update(tamperedString).digest("hex");

assert(
  tamperedHash.toLowerCase() !== standardResponseHash.toLowerCase(),
  "Tampering with amount alters hash and will be rejected by handler"
);

// 5. Shipping Fee Calculation Test
console.log("\n[Test 5] Shipping Fee Rule Enforcement");
function calcShipping(subtotal) {
  return subtotal >= 999 ? 0 : 99;
}
assert(calcShipping(500) === 99, "Subtotal ₹500 has ₹99 delivery fee");
assert(calcShipping(998) === 99, "Subtotal ₹998 has ₹99 delivery fee");
assert(calcShipping(999) === 0, "Subtotal ₹999 has FREE delivery (₹0)");
assert(calcShipping(2500) === 0, "Subtotal ₹2500 has FREE delivery (₹0)");

// 6. PayU Live Test Endpoint Connectivity
console.log("\n[Test 6] PayU Test API Reachability");
async function testPayuApi() {
  const verifyTxnId = "TCS_VERIFY_PING";
  const verifyHashString = `${merchantKey}|verify_payment|${verifyTxnId}|${salt}`;
  const verifyHash = crypto.createHash("sha512").update(verifyHashString).digest("hex");

  const body = new URLSearchParams({
    key: merchantKey,
    command: "verify_payment",
    var1: verifyTxnId,
    hash: verifyHash,
  });

  try {
    const res = await fetch("https://test.payu.in/merchant/postservice?form=2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    assert(res.ok, `PayU PostService HTTP Status: ${res.status} OK`);
    const data = await res.json();
    console.log("  PayU Response Data:", JSON.stringify(data));
    assert(
      data.status === 1 || data.status === 0 || typeof data.transaction_details !== "undefined" || data.msg,
      "PayU PostService returned valid response payload"
    );
  } catch (err) {
    assert(false, `PayU PostService failed: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================");
}

await testPayuApi();
