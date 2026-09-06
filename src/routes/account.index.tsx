import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, whatsappLink } from "@/lib/brand";

export const Route = createFileRoute("/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">Hello{user?.email ? `, ${user.email}` : ""} 🎉</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your celebration orders and saved products from here.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="hero">
            <Link to="/account/orders">View my orders</Link>
          </Button>
          <Button asChild variant="soft">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        <h3 className="font-bold">Need help?</h3>
        <p className="mt-1 text-muted-foreground">
          Call {BRAND.phoneDisplay} or{" "}
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="text-pink underline">
            message us on WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}
