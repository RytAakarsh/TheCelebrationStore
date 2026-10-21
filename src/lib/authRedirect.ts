/**
 * Safe Auth Redirect Utilities
 * Ensures open-redirect protection and preserves checkout destinations
 * across browser navigation, page reloads, and OAuth callbacks.
 */

const AUTH_REDIRECT_KEY = "tcs_auth_redirect";

/**
 * Validates that a redirect path is a safe, relative internal destination.
 * Rejects protocol-relative URLs (//), backslashes, absolute schemes,
 * and external domains.
 */
export function getSafeRedirect(target?: string | null, fallback = "/account"): string {
  if (!target || typeof target !== "string") return fallback;
  const trimmed = target.trim();

  // Must begin with a single slash '/'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Reject URLs with explicit schemes (e.g. javascript:, data:, https:)
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Persists the intended destination before initiating login or OAuth redirect.
 * Saves to both sessionStorage and localStorage for resilience across
 * cross-domain browser transitions (e.g., Google OAuth).
 */
export function saveAuthRedirect(target?: string | null): void {
  if (typeof window === "undefined") return;
  const safe = getSafeRedirect(target, "");
  if (!safe) return;

  try {
    window.sessionStorage.setItem(AUTH_REDIRECT_KEY, safe);
  } catch {
    // ignore
  }

  try {
    window.localStorage.setItem(AUTH_REDIRECT_KEY, safe);
  } catch {
    // ignore
  }
}

/**
 * Retrieves and validates any pending post-auth redirect destination.
 */
export function getSavedAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;

  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  } catch {
    // ignore
  }

  if (!stored) {
    try {
      stored = window.localStorage.getItem(AUTH_REDIRECT_KEY);
    } catch {
      // ignore
    }
  }

  if (!stored) return null;
  const safe = getSafeRedirect(stored, "");
  return safe || null;
}

/**
 * Clears the stored post-auth destination once navigation succeeds.
 */
export function clearAuthRedirect(): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  } catch {
    // ignore
  }

  try {
    window.localStorage.removeItem(AUTH_REDIRECT_KEY);
  } catch {
    // ignore
  }
}
