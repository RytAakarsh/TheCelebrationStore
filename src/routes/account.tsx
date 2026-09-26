import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";
import { User, Package, Heart, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: `My Account — ${BRAND.name}` },
      { name: "description", content: `Manage your ${BRAND.name} profile, saved addresses and orders.` },
      { property: "og:title", content: `My Account — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="My Account" subtitle="Sign in to manage your celebration profile" />
        <EmptyState
          title="Sign in to your celebration account"
          description="Track your orders, save delivery addresses, and manage your wishlist."
          action={
            <Button asChild className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold px-8 shadow-pink" size="lg">
              <Link to="/auth" search={{ next: "/account" }}>Sign in with Google / Email</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader
        title="My Account"
        subtitle={user?.email ?? ""}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "My Account" }]}
      />

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Navigation Sidebar */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col no-scrollbar" aria-label="Account Navigation">
          <Link
            to="/account"
            className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
              pathname === "/account" || pathname === "/account/"
                ? "bg-gold text-ink shadow-sm"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-ink border border-border"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile &amp; Addresses</span>
          </Link>

          <Link
            to="/account/orders"
            className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
              pathname.includes("orders")
                ? "bg-gold text-ink shadow-sm"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-ink border border-border"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>My Orders &amp; Tracking</span>
          </Link>

          <Link
            to="/wishlist"
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-pink transition-all"
          >
            <Heart className="h-4 w-4 text-pink" />
            <span>Saved Wishlist</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2.5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-bold text-gold-foreground hover:bg-gold/20 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-left text-xs font-bold text-destructive hover:bg-destructive/10 transition-all mt-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Account Outlet Content */}
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </ShopLayout>
  );
}
