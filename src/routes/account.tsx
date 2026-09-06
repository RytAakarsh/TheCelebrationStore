import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Vizag Party World" },
      { name: "description", content: "Manage your Vizag Party World profile and orders." },
      { property: "og:title", content: "My Account — Vizag Party World" },
      { property: "og:description", content: "Your profile and order history." },
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
        <PageHeader title="My Account" />
        <EmptyState
          title="Sign in to your account"
          description="Track orders, save addresses and manage your wishlist."
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/account" }}>Sign in</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader title="My Account" subtitle={user?.email ?? ""} />
      <div className="container-page grid gap-6 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Account">
          <Link
            to="/account"
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${pathname === "/account" ? "bg-secondary" : ""}`}
          >
            Overview
          </Link>
          <Link
            to="/account/orders"
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${pathname.includes("orders") ? "bg-secondary" : ""}`}
          >
            My Orders
          </Link>
          <Link to="/wishlist" className="rounded-xl px-3 py-2 text-sm font-semibold">
            Wishlist
          </Link>
          {isAdmin && (
            <Link to="/admin" className="rounded-xl px-3 py-2 text-sm font-semibold text-pink">
              Admin panel
            </Link>
          )}
          <button onClick={() => signOut()} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-destructive">
            Sign out
          </button>
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </ShopLayout>
  );
}
