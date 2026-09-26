import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, whatsappLink } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, MapPin, Package, Heart, Plus, Trash2, CheckCircle2, MessageCircle, Phone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [editProfile, setEditProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: "",
    phone: "",
    house: "",
    street: "",
    area: "",
    landmark: "",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "",
  });

  // Profile data
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) return null;
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
      return data;
    },
  });

  // Saved Addresses
  const { data: addresses } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      setEditProfile(false);
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  // Add Address
  const addAddressMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: newAddr.full_name.trim(),
        phone: newAddr.phone.trim(),
        house: newAddr.house.trim() || null,
        street: newAddr.street.trim() || null,
        area: newAddr.area.trim() || null,
        landmark: newAddr.landmark.trim() || null,
        city: newAddr.city.trim(),
        state: newAddr.state.trim(),
        pincode: newAddr.pincode.trim(),
        is_default: (addresses?.length ?? 0) === 0,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses", user?.id] });
      setShowAddAddr(false);
      setNewAddr({
        full_name: "",
        phone: "",
        house: "",
        street: "",
        area: "",
        landmark: "",
        city: "Visakhapatnam",
        state: "Andhra Pradesh",
        pincode: "",
      });
      toast.success("Address added successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add address");
    },
  });

  // Delete Address
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast.success("Address removed.");
    },
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Summary */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold font-bold text-lg">
              {profile?.full_name ? profile.full_name[0]?.toUpperCase() : "🎉"}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                Welcome, {profile?.full_name || user?.email?.split("@")[0]}!
              </h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProfile(!editProfile)}
            className="rounded-xl text-xs"
          >
            {editProfile ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {editProfile && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate();
            }}
            className="pt-4 border-t border-border space-y-4 max-w-md"
          >
            <div>
              <Label className="text-xs font-semibold text-ink">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="rounded-xl mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-ink">Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="rounded-xl mt-1 text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={updateProfileMutation.isPending}
              className="rounded-xl bg-pink text-white hover:bg-pink/90 text-xs font-bold"
            >
              Save Profile Changes
            </Button>
          </form>
        )}

        {/* Quick Shortcut Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <Link
            to="/account/orders"
            className="rounded-2xl border border-border bg-secondary/40 p-4 hover:border-gold transition text-left space-y-1"
          >
            <Package className="h-5 w-5 text-gold" />
            <p className="text-xs font-bold text-ink">My Orders</p>
            <p className="text-[11px] text-muted-foreground">Track delivery status</p>
          </Link>

          <Link
            to="/wishlist"
            className="rounded-2xl border border-border bg-secondary/40 p-4 hover:border-pink transition text-left space-y-1"
          >
            <Heart className="h-5 w-5 text-pink" />
            <p className="text-xs font-bold text-ink">Saved Wishlist</p>
            <p className="text-[11px] text-muted-foreground">View saved items</p>
          </Link>

          <Link
            to="/shop"
            className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-secondary/40 p-4 hover:border-purple transition text-left space-y-1"
          >
            <Sparkles className="h-5 w-5 text-purple" />
            <p className="text-xs font-bold text-ink">Celebration Store</p>
            <p className="text-[11px] text-muted-foreground">Explore supplies</p>
          </Link>
        </div>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <p className="text-xs text-muted-foreground">Addresses used for quick checkout</p>
          </div>

          <Button
            size="sm"
            variant="gold"
            onClick={() => setShowAddAddr(!showAddAddr)}
            className="rounded-xl text-xs font-bold"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {showAddAddr ? "Cancel" : "Add Address"}
          </Button>
        </div>

        {/* Add Address Form */}
        {showAddAddr && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newAddr.full_name || !newAddr.phone || !newAddr.city || !newAddr.pincode) {
                toast.error("Please fill required fields (Name, Phone, City, PIN Code)");
                return;
              }
              addAddressMutation.mutate();
            }}
            className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3"
          >
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">New Delivery Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input
                  required
                  value={newAddr.full_name}
                  onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                  placeholder="Recipient Name"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Phone *</Label>
                <Input
                  required
                  type="tel"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">House / Flat / Building</Label>
                <Input
                  value={newAddr.house}
                  onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                  placeholder="House number, apartment"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Street / Locality</Label>
                <Input
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Street name"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">City *</Label>
                <Input
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  placeholder="City"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">State *</Label>
                <Input
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  placeholder="State"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">PIN Code *</Label>
                <Input
                  required
                  maxLength={6}
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  placeholder="6-digit PIN code"
                  className="rounded-xl text-xs bg-card mt-1"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={addAddressMutation.isPending}
                className="rounded-xl bg-pink text-white hover:bg-pink/90 text-xs font-bold"
              >
                Save Delivery Address
              </Button>
            </div>
          </form>
        )}

        {/* List of Saved Addresses */}
        {addresses && addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-2xl border border-border bg-[#FFFDF9] p-4 text-xs space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{addr.full_name}</span>
                  <button
                    type="button"
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Delete address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-muted-foreground font-medium">📞 {addr.phone}</p>
                <p className="text-muted-foreground leading-relaxed">
                  {[addr.house, addr.street, addr.area, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                </p>
                {addr.is_default && (
                  <span className="inline-block rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold text-gold-foreground">
                    ✓ Default Address
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            You haven't saved any delivery addresses yet. Add one above for quick checkout!
          </p>
        )}
      </div>

      {/* Support Card */}
      <div className="rounded-3xl border border-border bg-card p-6 text-xs text-muted-foreground space-y-2">
        <h4 className="font-bold text-ink">Need Celebration Assistance?</h4>
        <p>
          Have questions about your order or custom event planning? Reach our Visakhapatnam store at{" "}
          <a href={`tel:+91${BRAND.phone}`} className="font-semibold text-pink">{BRAND.phoneDisplay}</a> or{" "}
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 underline">
            chat with us on WhatsApp
          </a>.
        </p>
      </div>
    </div>
  );
}
