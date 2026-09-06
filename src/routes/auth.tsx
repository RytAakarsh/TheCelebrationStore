import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";

type AuthSearch = { next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch =>
    typeof search["next"] === "string" && search["next"].startsWith("/") ? { next: search["next"] } : {},
  head: () => ({
    meta: [
      { title: "Sign in — Vizag Party World" },
      { name: "description", content: "Sign in to shop, track orders and save favourites at Vizag Party World." },
      { property: "og:title", content: "Sign in — Vizag Party World" },
      { property: "og:description", content: "Access your cart, wishlist and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: (next ?? "/account") as never, replace: true });
  }, [user, loading, next, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${next ?? "/account"}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: (next ?? "/account") as never });
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email.");
  }

  return (
    <ShopLayout>
      <div className="container-page flex justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {BRAND.name} — {BRAND.tagline}
          </p>

          {sent ? (
            <p className="mt-6 rounded-xl bg-secondary p-4 text-sm">
              We&apos;ve emailed you a confirmation link. Click it to activate your account, then sign in.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={80} />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="soft" size="lg" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              className="font-semibold text-pink hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setSent(false);
              }}
            >
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
            {mode === "signin" && (
              <button type="button" className="text-muted-foreground hover:underline" onClick={resetPassword}>
                Forgot password?
              </button>
            )}
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and{" "}
            <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </ShopLayout>
  );
}
