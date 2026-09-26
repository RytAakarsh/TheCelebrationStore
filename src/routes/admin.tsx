import { useEffect } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { AdminShell, AdminLoading } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Admin Console — ${BRAND.name}` },
      { name: "description", content: `Private store management console for ${BRAND.name}.` },
      { property: "og:title", content: `Admin Console — ${BRAND.name}` },
      { property: "og:description", content: "Private store management console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/admin/login";
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogin || loading) return;
    if (!user) navigate({ to: "/admin/login", replace: true });
  }, [isLogin, loading, user, navigate]);

  if (isLogin) return <Outlet />;
  if (loading || !user) return <AdminLoading />;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Admin access required</h1>
          <p className="mt-2 text-sm text-cream/70">
            This account is not an administrator of {BRAND.name}.
          </p>
          <button
            className="mt-6 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink"
            onClick={() => navigate({ to: "/admin/login", replace: true })}
          >
            Use another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
