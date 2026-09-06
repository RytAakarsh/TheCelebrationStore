import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { CARD_SELECT, type CardProduct } from "@/lib/queries";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Vizag Party World" },
      { name: "description", content: "Products you saved for your next celebration." },
      { property: "og:title", content: "Your Wishlist — Vizag Party World" },
      { property: "og:description", content: "Saved party supplies and gifts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const { items } = useWishlist();
  const productIds = items.map((i) => i.product_id);

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist-products", productIds],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(CARD_SELECT).in("id", productIds);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as CardProduct[];
    },
  });

  if (!loading && !user) {
    return (
      <ShopLayout>
        <PageHeader title="Wishlist" />
        <EmptyState
          title="Sign in to see your wishlist"
          description="Save your favourite party products to your account."
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/wishlist" }}>Sign in</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader title="Wishlist" subtitle={`${productIds.length} saved item${productIds.length === 1 ? "" : "s"}`} />
      <div className="container-page py-5">
        <ProductGrid
          products={data ?? []}
          loading={isLoading && productIds.length > 0}
          emptyTitle="Nothing saved yet"
          emptyText="Tap the heart on any product to save it here."
        />
      </div>
    </ShopLayout>
  );
}
