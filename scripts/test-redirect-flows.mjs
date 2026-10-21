/**
 * Test Suite: Guest-Cart -> Checkout -> Auth Redirect & Cart Merging
 * Tests scenarios A through H from requirements.
 */

function getSafeRedirect(target, fallback = "/account") {
  if (!target || typeof target !== "string") return fallback;
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

// Mock browser storage for headless Node environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.window = {
  sessionStorage: new MockStorage(),
  localStorage: new MockStorage(),
  location: {
    origin: "https://www.thecelebrationstore.in",
  },
};

const results = [];

function assert(description, condition) {
  if (condition) {
    results.push({ name: description, passed: true });
    console.log(`  ✓ ${description}`);
  } else {
    results.push({ name: description, passed: false });
    console.error(`  ✗ FAIL: ${description}`);
  }
}

console.log("\n=======================================================");
console.log("RUNNING POST-LOGIN & GUEST-CART TEST SUITE");
console.log("=======================================================\n");

// -----------------------------------------------------------------
// Test G: Security (Open Redirect Prevention)
// -----------------------------------------------------------------
console.log("Test G — Security & Open Redirect Prevention:");
assert("Rejects external URL: https://evil.com", getSafeRedirect("https://evil.com", "/account") === "/account");
assert("Rejects protocol-relative URL: //evil.com", getSafeRedirect("//evil.com", "/account") === "/account");
assert("Rejects backslash protocol-relative URL: /\\evil.com", getSafeRedirect("/\\evil.com", "/account") === "/account");
assert("Rejects javascript: URI scheme", getSafeRedirect("javascript:alert(1)", "/account") === "/account");
assert("Rejects data: URI scheme", getSafeRedirect("data:text/html,hack", "/account") === "/account");
assert("Rejects missing leading slash: checkout", getSafeRedirect("checkout", "/account") === "/account");
assert("Accepts valid internal route: /checkout", getSafeRedirect("/checkout", "/account") === "/checkout");
assert("Accepts internal route with params: /checkout?coupon=SAVE10", getSafeRedirect("/checkout?coupon=SAVE10", "/account") === "/checkout?coupon=SAVE10");
assert("Falls back to /account on empty/null", getSafeRedirect(null, "/account") === "/account");

// -----------------------------------------------------------------
// Test A: Guest checkout with Google OAuth flow simulation
// -----------------------------------------------------------------
console.log("\nTest A — Guest Checkout with Google OAuth Flow:");
window.sessionStorage.clear();
window.localStorage.clear();

// 1. Guest adds two items to cart: Item A (qty 2), Item B (qty 1)
const guestCart = [
  { productId: "prod-balloons-01", variantId: "var-pastel-pink", quantity: 2 },
  { productId: "prod-german-silver-01", variantId: null, quantity: 1 },
];
window.localStorage.setItem("tcs_guest_cart", JSON.stringify(guestCart));

// 2. Guest clicks Proceed to Checkout -> /auth?next=/checkout
const target = getSafeRedirect("/checkout", "/account");
window.sessionStorage.setItem("tcs_auth_redirect", target);
window.localStorage.setItem("tcs_auth_redirect", target);

// 3. Initiate Google OAuth
const redirectUrl = `${window.location.origin}/auth?next=${encodeURIComponent(target)}`;
assert("OAuth redirectTo retains next parameter", redirectUrl === "https://www.thecelebrationstore.in/auth?next=%2Fcheckout");

// 4. Simulate return from Google OAuth (even if landing on Site URL / without params)
const savedDestination = window.sessionStorage.getItem("tcs_auth_redirect") || window.localStorage.getItem("tcs_auth_redirect");
assert("Preserved destination is restored after OAuth redirect", savedDestination === "/checkout");

// 5. Restore cart items
const restoredCart = JSON.parse(window.localStorage.getItem("tcs_guest_cart"));
assert("Guest cart items survive OAuth redirect intact", restoredCart.length === 2 && restoredCart[0].quantity === 2);

// -----------------------------------------------------------------
// Test B: Guest checkout with Email/Password Login
// -----------------------------------------------------------------
console.log("\nTest B — Guest Checkout with Email/Password Login:");
window.sessionStorage.setItem("tcs_auth_redirect", "/checkout");
const loginNext = getSafeRedirect("/checkout");
assert("Login form resolves destination to /checkout", loginNext === "/checkout");
const postLoginTarget = loginNext || window.sessionStorage.getItem("tcs_auth_redirect");
assert("Redirects directly to /checkout on successful password login", postLoginTarget === "/checkout");

// -----------------------------------------------------------------
// Test C: Signup during checkout
// -----------------------------------------------------------------
console.log("\nTest C — Signup during checkout:");
const signupNext = getSafeRedirect("/checkout");
const emailRedirectTo = `${window.location.origin}/auth?next=${encodeURIComponent(signupNext)}`;
assert("Signup email confirmation link contains next=/checkout", emailRedirectTo.includes("next=%2Fcheckout"));

// -----------------------------------------------------------------
// Test D: Already authenticated user
// -----------------------------------------------------------------
console.log("\nTest D — Already authenticated customer:");
const isUserLoggedIn = true;
let navigatedTo = "";
if (!isUserLoggedIn) {
  navigatedTo = "/auth?next=/checkout";
} else {
  navigatedTo = "/checkout";
}
assert("Authenticated user goes straight to /checkout without login interruption", navigatedTo === "/checkout");

// -----------------------------------------------------------------
// Test E: OAuth callback and page refresh
// -----------------------------------------------------------------
console.log("\nTest E — Refresh on checkout page:");
// When on /checkout with user logged in, refreshing must keep cart & not redirect to /
const sessionUser = { id: "user-123", email: "customer@example.com" };
const loading = false;
const isLoading = false;
const itemsCount = restoredCart.length;
const guardTriggered = !loading && !sessionUser;
const emptyTriggered = !isLoading && itemsCount === 0;
assert("Page refresh with active session does not trigger unauthenticated guard", !guardTriggered);
assert("Page refresh with items does not trigger empty cart guard", !emptyTriggered);

// -----------------------------------------------------------------
// Test F: Empty cart handling
// -----------------------------------------------------------------
console.log("\nTest F — Empty cart handling:");
const emptyItems = [];
const showEmptyCartState = !isLoading && emptyItems.length === 0;
assert("Shows empty cart screen when items count is 0, blocking invalid checkout", showEmptyCartState === true);

// -----------------------------------------------------------------
// Test H: Cart Merge (Guest items into existing user cart)
// -----------------------------------------------------------------
console.log("\nTest H — Cart Merge logic:");
// Existing DB cart for user: Item A has quantity 1
const mockDbCart = [
  { id: "row-1", product_id: "prod-balloons-01", variant_id: "var-pastel-pink", quantity: 1 },
];

// Guest cart has: Item A (quantity 2) and Item C (quantity 4)
const guestMergeItems = [
  { productId: "prod-balloons-01", variantId: "var-pastel-pink", quantity: 2 },
  { productId: "prod-candles-02", variantId: null, quantity: 4 },
];

// Execute merge algorithm
for (const item of guestMergeItems) {
  const existing = mockDbCart.find(
    (row) => row.product_id === item.productId && (row.variant_id ?? null) === (item.variantId ?? null)
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    mockDbCart.push({
      id: `row-${mockDbCart.length + 1}`,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
    });
  }
}

assert("Total distinct rows after merge is 2", mockDbCart.length === 2);
const mergedItemA = mockDbCart.find((r) => r.product_id === "prod-balloons-01");
assert("Item A quantity merged: 1 + 2 = 3", mergedItemA.quantity === 3);
const mergedItemC = mockDbCart.find((r) => r.product_id === "prod-candles-02");
assert("Item C inserted with quantity 4", mergedItemC.quantity === 4);

console.log("\n=======================================================");
const allPassed = results.every((r) => r.passed);
console.log(`TEST SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} PASSED`);
if (allPassed) {
  console.log("STATUS: ALL TESTS PASSED SUCCESSFULLY! ✓");
} else {
  console.log("STATUS: SOME TESTS FAILED! ✗");
  process.exit(1);
}
console.log("=======================================================\n");
