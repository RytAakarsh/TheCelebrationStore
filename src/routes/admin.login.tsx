import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shop/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: `Admin Sign In — ${BRAND.name}` },
      { name: "description", content: `Secure administrator login for ${BRAND.name} store management.` },
      { property: "og:title", content: `Admin Console — ${BRAND.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("thecelebrationstore@gmail.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both administrator email and password.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message || "Invalid administrator credentials.");
      return;
    }
    toast.success("Welcome to The Celebration Store Administration Console! 🎉");
    navigate({ to: "/admin", replace: true });
  };

  const forgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your admin email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset instructions sent to your email.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#101827] p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#161F30] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo variant="footer" height={48} />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Console</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Store Management Login</h1>
          <p className="text-xs text-cream/70 max-w-xs">
            Enter authorized credentials to access inventory, orders, catalog and marketing.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-semibold text-cream">Admin Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="thecelebrationstore@gmail.com"
                className="rounded-xl pl-9 text-xs bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-semibold text-cream">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="rounded-xl pl-9 text-xs bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-2xl bg-gold text-ink hover:bg-gold-premium font-bold shadow-gold text-xs h-12"
            disabled={busy}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </span>
            ) : (
              <span>Sign In to Admin Console</span>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={forgot}
            className="text-cream/70 hover:text-gold hover:underline"
          >
            Forgot password?
          </button>

          <Link to="/" className="text-cream/70 hover:text-gold flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            <span>Return to store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
