import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, RotateCw, AlertCircle } from "lucide-react";
import { getSafeRedirect, saveAuthRedirect, getSavedAuthRedirect, clearAuthRedirect } from "@/lib/authRedirect";
import { getGuestCart } from "@/hooks/useCart";

type AuthSearch = {
  next?: string;
  code?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    next: typeof search["next"] === "string" ? getSafeRedirect(search["next"], undefined as any) : undefined,
    code: typeof search["code"] === "string" ? search["code"] : undefined,
    error: typeof search["error"] === "string" ? search["error"] : undefined,
    error_code: typeof search["error_code"] === "string" ? search["error_code"] : undefined,
    error_description: typeof search["error_description"] === "string" ? search["error_description"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Sign in / Join — ${BRAND.name}` },
      { name: "description", content: `Sign in to shop, track orders and save favourites at ${BRAND.name}.` },
      { property: "og:title", content: `Sign in — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
  errorComponent: AuthErrorComponent,
});

function AuthErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Auth page error:", error);
  return (
    <ShopLayout>
      <div className="container-page flex justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-10 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Authentication Notice</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error?.message || "There was a problem loading the sign-in page. Please try refreshing or return to homepage."}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button onClick={() => reset()} className="rounded-xl text-xs font-semibold bg-pink text-white hover:bg-pink/90">
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-xl text-xs font-semibold">
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}

function AuthPage() {
  const { next, code, error: oauthError, error_description: oauthErrorDesc } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const isHashAuth =
    typeof window !== "undefined" &&
    (window.location.hash.includes("access_token") || window.location.hash.includes("type="));
  const [oauthChecking, setOauthChecking] = useState(Boolean(code) || isHashAuth);

  const getDestination = () => {
    return getSafeRedirect(next) || getSavedAuthRedirect() || (getGuestCart().length > 0 ? "/checkout" : "/account");
  };

  const effectiveTarget = getDestination();

  useEffect(() => {
    if (next) {
      saveAuthRedirect(next);
    }
  }, [next]);

  useEffect(() => {
    if (oauthError || oauthErrorDesc) {
      const msg = oauthErrorDesc || oauthError || "Authentication was cancelled or encountered an error.";
      console.warn("[Auth] OAuth error callback:", { oauthError, oauthErrorDesc });
      toast.error(msg);
      setOauthChecking(false);
    }
  }, [oauthError, oauthErrorDesc]);

  // If user is already logged in or session restored, navigate to destination
  useEffect(() => {
    if (!loading && user) {
      const target = getDestination();
      clearAuthRedirect();
      navigate({ to: target as never, replace: true });
    }
  }, [user, loading, next, navigate]);

  useEffect(() => {
    const hasHash =
      typeof window !== "undefined" &&
      (window.location.hash.includes("access_token") || window.location.hash.includes("type="));

    if (code || hasHash) {
      setOauthChecking(true);
      const target = getDestination();
      saveAuthRedirect(target);

      const checkAuth = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error("[Auth] Session resolution error:", error);
            toast.error("Could not complete authentication. Please try logging in again.");
            setOauthChecking(false);
            return;
          }

          if (data.session) {
            toast.success(`Welcome to ${BRAND.name}! 🎉`);
            clearAuthRedirect();
            navigate({ to: target as never, replace: true });
          } else {
            // Allow up to 3.5 seconds for async token extraction from URL hash
            const timer = setTimeout(async () => {
              const { data: retryData } = await supabase.auth.getSession();
              if (retryData.session) {
                toast.success(`Welcome to ${BRAND.name}! 🎉`);
                clearAuthRedirect();
                navigate({ to: target as never, replace: true });
              } else {
                setOauthChecking(false);
              }
            }, 3000);
            return () => clearTimeout(timer);
          }
        } catch (e) {
          console.error("[Auth] Unexpected token verification error:", e);
          setOauthChecking(false);
        }
      };

      checkAuth();
    }
  }, [code, next, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const target = getDestination();
    saveAuthRedirect(target);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Account created! Please check your email to activate it.");
        } else {
          toast.success(`Welcome to ${BRAND.name}! 🎉`);
          clearAuthRedirect();
          navigate({ to: target as never, replace: true });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back! 🎉");
        clearAuthRedirect();
        navigate({ to: target as never, replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Email not confirmed")) {
        setSent(true);
        toast.error("Your email is not confirmed yet. Please click the verification link in your email, or click Resend below.");
      } else if (msg.includes("weak_password") || msg.includes("weak and easy to guess")) {
        toast.error("This password is too common or weak. Please enter at least 8 characters with a mix of letters and numbers.");
      } else {
        toast.error(msg || "Authentication failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      toast.error("Please enter your email address first.");
      return;
    }
    setBusy(true);
    try {
      const target = getDestination();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
        },
      });
      if (error) throw error;
      toast.success("Confirmation email resent! Please check your inbox and spam folder.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend confirmation email.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const target = getDestination();
    saveAuthRedirect(target);
    try {
      const redirectUrl = `${window.location.origin}/auth?next=${encodeURIComponent(target)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("[Auth] Google sign-in failed:", err);
      toast.error(err.message || "Google sign-in could not be initiated.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      toast.error("Please enter your email address first.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Could not send reset email.");
    }
  }

  return (
    <ShopLayout>
      <div className="container-page flex justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
              <Sparkles className="h-3.5 w-3.5" /> {BRAND.name}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {mode === "signin" ? "Welcome Back!" : "Join The Celebration"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {BRAND.tagline} • Visakhapatnam
            </p>
          </div>

          {(next === "/checkout" || effectiveTarget === "/checkout") && (
            <div className="rounded-2xl border border-pink/30 bg-pink/5 p-4 text-xs text-ink space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-pink">
                <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                <span>Sign in or create an account to continue to checkout</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Your cart will be saved! An account is required to safely store your delivery addresses, track courier updates, and send celebration receipts.
              </p>
            </div>
          )}

          {oauthChecking && !user ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm font-semibold text-ink">Completing authentication...</p>
              <p className="text-xs text-muted-foreground">Please wait a moment while we set up your celebration account and sync your cart.</p>
            </div>
          ) : (
            <>
              {/* Primary Google Login Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-2xl border-border hover:bg-secondary font-bold text-xs h-12 flex items-center justify-center gap-2.5 shadow-sm"
                onClick={google}
                disabled={busy}
              >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-border" />
            <span className="absolute bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase">
              Or with email
            </span>
          </div>

          {sent ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-xs text-emerald-800 space-y-3 text-center">
              <p className="font-bold text-sm">Confirmation link sent!</p>
              <p>We've sent an activation link to <strong>{email}</strong>. Please check your inbox (and spam folder) to activate your celebration account.</p>
              {typeof window !== "undefined" && getGuestCart().length > 0 && (
                <div className="rounded-xl bg-white/90 border border-emerald-300/70 p-3 text-left text-[11px] text-emerald-950 space-y-1 shadow-xs">
                  <p className="font-semibold text-emerald-900">🛒 Your cart items are safely preserved!</p>
                  <p className="text-muted-foreground">When you click the activation link in your email, you will be redirected straight to checkout with all your items ready.</p>
                  <p className="text-[10px] text-muted-foreground italic">Tip: If confirming on your phone, open the link in your regular browser (Chrome/Safari) to continue seamlessly.</p>
                </div>
              )}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={resendConfirmation}
                  className="rounded-xl text-xs font-semibold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                  Resend confirmation email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSent(false)}
                  className="rounded-xl text-xs text-emerald-700"
                >
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-ink">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Ramesh Varma"
                      className="rounded-xl pl-9 text-xs"
                      maxLength={80}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-ink">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. yourname@gmail.com"
                    className="rounded-xl pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-ink">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="rounded-xl pl-9 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-pink text-white hover:bg-pink/90 font-bold shadow-pink text-xs h-12"
                size="lg"
              >
                {busy ? "Please wait..." : mode === "signin" ? "Sign In to Store" : "Create Celebration Account"}
              </Button>
            </form>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-border">
            <button
              type="button"
              className="font-bold text-pink hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setSent(false);
              }}
            >
              {mode === "signin" ? "New here? Create account" : "Already registered? Sign in"}
            </button>

            {mode === "signin" && (
              <button
                type="button"
                className="text-muted-foreground hover:text-ink hover:underline"
                onClick={resetPassword}
              >
                Forgot password?
              </button>
            )}
          </div>
            </>
          )}

          <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
            By proceeding, you agree to {BRAND.name}&apos;s{" "}
            <Link to="/terms" className="underline hover:text-gold">Terms of Service</Link> and{" "}
            <Link to="/privacy-policy" className="underline hover:text-gold">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </ShopLayout>
  );
}
