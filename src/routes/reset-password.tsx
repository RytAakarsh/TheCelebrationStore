import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { KeyRound, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Reset Password — ${BRAND.name}` },
      { name: "description", content: `Set a new password for your ${BRAND.name} account.` },
      { property: "og:title", content: `Reset Password — ${BRAND.name}` },
      { property: "og:description", content: "Set a new password for your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated successfully!");
    navigate({ to: "/account" });
  };

  return (
    <ShopLayout>
      <PageHeader title="Reset Password" subtitle="Choose a secure new password for your account" />
      <div className="container-page py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="mt-3 font-display text-xl font-bold">New Security Password</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your new password below to regain access to your account and saved orders.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password (min 6 characters)</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </ShopLayout>
  );
}
