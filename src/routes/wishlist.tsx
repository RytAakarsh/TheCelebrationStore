import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader, EmptyState } from "@/components/shop/ShopLayout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { CARD_SELECT, type CardProduct } from "@/lib/queries";
import { BRAND } from "@/lib/brand";
import { Heart, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: `Your Wishlist — ${BRAND.name}` },
      { name: "description", content: "Products you saved for your upcoming celebration." },
      { property: "og:title", content: `Your Wishlist — ${BRAND.name}` },
      { property: "og:description", content: "Saved celebration party supplies, decor, and return gifts." },
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
        <PageHeader title="My Saved Wishlist" />
        <EmptyState
          icon={Heart}
          title="Sign in to view your wishlist"
          description="Save all your favourite party essentials and return gifts to plan your upcoming events."
          action={
            <Button asChild variant="hero" size="lg">
              <Link to="/auth" search={{ next: "/wishlist" }}>Sign In to Account</Link>
            </Button>
          }
        />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader
        title="My Saved Wishlist"
        subtitle={`${productIds.length} saved item${productIds.length === 1 ? "" : "s"} for your next celebration`}
      />
      <div className="container-page py-6">
        <ProductGrid
          products={data ?? []}
          loading={isLoading && productIds.length > 0}
          emptyTitle="Your wishlist is empty"
          emptyText="Tap the heart icon on any product to bookmark it for your birthday, wedding, or celebration."
        />
        {productIds.length === 0 && !isLoading && (
          <div className="mt-4 flex justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" /> Explore All Products
              </Link>
            </Button>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
