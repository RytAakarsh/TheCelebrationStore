import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDateIST, inr } from "@/lib/format";
import { BRAND, whatsappLink } from "@/lib/brand";
import { Users, Search, Phone, Mail, MessageCircle, ShoppingBag, Calendar, Shield } from "lucide-react";

export const Route = createFileRoute("/admin/customers/")({
  component: AdminCustomersPage,
});

type CustomerRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id,total,created_at,status"),
      ]);

      if (profilesRes.error) throw new Error(profilesRes.error.message);

      const profiles = profilesRes.data ?? [];
      const orders = ordersRes.data ?? [];

      const statsByUser = new Map<string, { count: number; spent: number; lastOrder: string | null }>();
      for (const o of orders) {
        if (!o.user_id) continue;
        const prev = statsByUser.get(o.user_id) ?? { count: 0, spent: 0, lastOrder: null };
        prev.count += 1;
        if (o.status !== "cancelled" && o.status !== "refunded") {
          prev.spent += Number(o.total || 0);
        }
        if (!prev.lastOrder || new Date(o.created_at) > new Date(prev.lastOrder)) {
          prev.lastOrder = o.created_at;
        }
        statsByUser.set(o.user_id, prev);
      }

      return profiles.map((p) => {
        const stats = statsByUser.get(p.id) ?? { count: 0, spent: 0, lastOrder: null };
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          status: p.status || "active",
          created_at: p.created_at,
          last_login_at: p.last_login_at,
          orderCount: stats.count,
          totalSpent: stats.spent,
          lastOrderDate: stats.lastOrder,
        } as CustomerRecord;
      });
    },
  });

  if (isLoading) return <AdminLoading />;

  const filtered = (customers ?? []).filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  });

  const totalSpentAll = (customers ?? []).reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <AdminPage
      title="Customer Directory"
      description="Registered store accounts, ordering frequency and customer spending records"
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Customers</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">{customers?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Buyers</p>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-1">
            {(customers ?? []).filter((c) => c.orderCount > 0).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Customer Spend</p>
          <p className="font-display text-2xl font-bold text-pink mt-1">{inr(totalSpentAll)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Avg Spend / Buyer</p>
          <p className="font-display text-2xl font-bold text-gold mt-1">
            {inr(
              (customers ?? []).filter((c) => c.orderCount > 0).length
                ? totalSpentAll / (customers ?? []).filter((c) => c.orderCount > 0).length
                : 0,
            )}
          </p>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, email, or mobile number..."
          className="border-0 shadow-none focus-visible:ring-0 text-xs"
        />
        {search && (
          <Button size="sm" variant="ghost" onClick={() => setSearch("")} className="text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Customer Records Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-secondary/60 text-muted-foreground uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Orders Placed</th>
                <th className="px-5 py-3.5">Total Spent</th>
                <th className="px-5 py-3.5">Last Order</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold font-bold text-sm">
                          {c.full_name ? c.full_name[0]?.toUpperCase() : "👤"}
                        </div>
                        <div>
                          <p className="font-bold text-ink">{c.full_name || "Unnamed User"}</p>
                          <span className="text-[10px] text-muted-foreground">ID: {c.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 space-y-1">
                      <p className="flex items-center gap-1.5 text-ink">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{c.email || "No email"}</span>
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-bold text-ink">
                        <ShoppingBag className="h-3 w-3 text-gold" />
                        <span>{c.orderCount}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 font-display font-bold text-sm text-ink">
                      {inr(c.totalSpent)}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {c.lastOrderDate ? formatDateIST(c.lastOrderDate) : "—"}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDateIST(c.created_at)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.phone && (
                          <a
                            href={whatsappLink(`Hello ${c.full_name || "there"}, greeting from ${BRAND.name}!`)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No customers found matching &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
