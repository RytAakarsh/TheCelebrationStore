import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SafeImage } from "@/components/shop/SafeImage";
import { LOGO_SRC } from "@/components/shop/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Vizag Party World" },
      { name: "description", content: "Secure sign in for the Vizag Party World store console." },
      { property: "og:title", content: "Admin Login — Vizag Party World" },
      { property: "og:description", content: "Secure store console sign in." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/admin", replace: true });
  };

  const forgot = async () => {
    if (!email.trim()) return toast.error("Enter your admin email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream/10 bg-card p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-3">
          <SafeImage src={LOGO_SRC} alt={`${BRAND.name} logo`} width={44} height={44} loading="eager" className="h-11 w-11 rounded-lg object-contain" />
          <div>
            <p className="font-display text-base font-bold">Vizag Party World</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Admin Console</p>
          </div>
        </div>

        <h1 className="mt-6 font-display text-xl font-bold">Sign in to manage your store</h1>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login to Admin Panel
          </Button>
        </form>

        <button type="button" onClick={forgot} className="mt-4 text-xs font-medium text-muted-foreground underline">
          Forgot password?
        </button>
      </div>
    </div>
  );
}
