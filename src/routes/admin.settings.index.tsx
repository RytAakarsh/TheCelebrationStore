import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save, Store, Truck, CreditCard, Globe, Share2, PhoneCall, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminSettingsPage,
});

type SettingsForm = {
  brand_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url: string;
  shipping_charge: number;
  free_shipping_threshold: number;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
  seo_title: string;
  seo_description: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
};

const DEFAULT_SETTINGS: SettingsForm = {
  brand_name: BRAND.name,
  tagline: BRAND.tagline,
  phone: BRAND.phone,
  whatsapp: BRAND.whatsapp,
  email: BRAND.email,
  address: BRAND.address,
  logo_url: "/the-celebration-store-logo.png",
  shipping_charge: 79,
  free_shipping_threshold: 999,
  cod_enabled: true,
  online_payment_enabled: true,
  seo_title: `${BRAND.name} — ${BRAND.tagline} | Visakhapatnam`,
  seo_description: `${BRAND.name} offers premium balloons, birthday party decor, German silver return gifts, backdrops & celebration supplies in Vizag. Free delivery above ₹999!`,
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
};

function AdminSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<SettingsForm>(DEFAULT_SETTINGS);

  const { data, isLoading } = useQuery({
    queryKey: ["site_settings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        brand_name: data.brand_name || BRAND.name,
        tagline: data.tagline || BRAND.tagline,
        phone: data.phone || BRAND.phone,
        whatsapp: data.whatsapp || BRAND.whatsapp,
        email: data.email || BRAND.email,
        address: data.address || BRAND.address,
        logo_url: data.logo_url || "/the-celebration-store-logo.png",
        shipping_charge: data.shipping_charge ?? 79,
        free_shipping_threshold: data.free_shipping_threshold ?? 999,
        cod_enabled: data.cod_enabled ?? true,
        online_payment_enabled: data.online_payment_enabled ?? true,
        seo_title: data.seo_title || `${BRAND.name} — ${BRAND.tagline}`,
        seo_description: data.seo_description || "",
        instagram_url: data.instagram_url || "",
        facebook_url: data.facebook_url || "",
        youtube_url: data.youtube_url || "",
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (updated: SettingsForm) => {
      const payload = {
        id: 1,
        ...updated,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Store settings updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update store settings");
    },
  });

  const handleChange = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return <AdminLoading />;

  return (
    <AdminPage
      title="Store Settings"
      description="Manage brand identity, contact information, shipping rules, payment methods, and SEO metadata."
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {/* Brand & Store Identity */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Store className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">Brand & Store Identity</h2>
              <p className="text-xs text-muted-foreground">Store name, tagline and physical storefront address</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                value={form.brand_name}
                onChange={(e) => handleChange("brand_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Physical Store Address *</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Displayed in order invoices, footer, and store locator.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="logo_url">Logo URL / Path</Label>
              <Input
                id="logo_url"
                value={form.logo_url}
                onChange={(e) => handleChange("logo_url", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <PhoneCall className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">Contact & Customer Support</h2>
              <p className="text-xs text-muted-foreground">Official support channels shown across the website</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Support Phone Number *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp Order Helpline *</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Official Store Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Shipping & Delivery Rules */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Truck className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">Shipping & Delivery Rates</h2>
              <p className="text-xs text-muted-foreground">Calculated dynamically in customer cart & checkout</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shipping_charge">Standard Flat Shipping Fee (₹)</Label>
              <Input
                id="shipping_charge"
                type="number"
                min="0"
                value={form.shipping_charge}
                onChange={(e) => handleChange("shipping_charge", Math.max(0, Number(e.target.value)))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Flat shipping fee applied when order subtotal is below the free shipping threshold.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (₹)</Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                value={form.free_shipping_threshold}
                onChange={(e) => handleChange("free_shipping_threshold", Math.max(0, Number(e.target.value)))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Orders with subtotal equal or exceeding this amount receive FREE standard shipping.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
            💡 Current Rule: Orders below {inr(form.free_shipping_threshold)} pay {inr(form.shipping_charge)} shipping; orders at or above {inr(form.free_shipping_threshold)} get <strong className="text-gold">FREE Delivery</strong>.
          </div>
        </section>

        {/* Payment Methods */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CreditCard className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">Payment Methods</h2>
              <p className="text-xs text-muted-foreground">Enable or disable checkout payment gateways</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-sm">Cash on Delivery (COD)</p>
                <p className="text-xs text-muted-foreground">Allow customers to pay cash upon order arrival</p>
              </div>
              <Switch
                checked={form.cod_enabled}
                onCheckedChange={(val) => handleChange("cod_enabled", val)}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-sm">Online Payments (UPI / Cards / Netbanking)</p>
                <p className="text-xs text-muted-foreground">Accept digital payments via Razorpay / Gateway</p>
              </div>
              <Switch
                checked={form.online_payment_enabled}
                onCheckedChange={(val) => handleChange("online_payment_enabled", val)}
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Share2 className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">Social Media Profiles</h2>
              <p className="text-xs text-muted-foreground">Links displayed in site header, footer and side menu</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="instagram_url">Instagram Profile URL</Label>
              <Input
                id="instagram_url"
                placeholder="https://instagram.com/thecelebrationstore"
                value={form.instagram_url}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="facebook_url">Facebook Page URL</Label>
              <Input
                id="facebook_url"
                placeholder="https://facebook.com/thecelebrationstore"
                value={form.facebook_url}
                onChange={(e) => handleChange("facebook_url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="youtube_url">YouTube Channel URL</Label>
              <Input
                id="youtube_url"
                placeholder="https://youtube.com/@thecelebrationstore"
                value={form.youtube_url}
                onChange={(e) => handleChange("youtube_url", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEO & Announcements */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Globe className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold">SEO & Top Announcement Banner</h2>
              <p className="text-xs text-muted-foreground">Search engine meta tags and header announcement text</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="seo_title">Default SEO Title</Label>
              <Input
                id="seo_title"
                value={form.seo_title}
                onChange={(e) => handleChange("seo_title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo_description">Default SEO Description & Top Bar Strip</Label>
              <Textarea
                id="seo_description"
                rows={3}
                value={form.seo_description}
                onChange={(e) => handleChange("seo_description", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This text will also power the top animated announcement ribbon across all store pages.
              </p>
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-gold" />
            Changes take effect immediately across customer storefront and admin.
          </div>
          <Button type="submit" variant="hero" size="lg" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Store Settings
          </Button>
        </div>
      </form>
    </AdminPage>
  );
}
