import { createFileRoute } from "@tanstack/react-router";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vizag Party World — Party Supplies in Visakhapatnam" },
      {
        name: "description",
        content:
          "Vizag Party World is your one-stop destination for balloons, decorations, German silver return gifts and celebration essentials in Visakhapatnam.",
      },
      { property: "og:title", content: "About Vizag Party World" },
      { property: "og:description", content: "Make Every Moment Special with our celebration essentials." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <ShopLayout>
      <PageHeader title="About Us" subtitle={BRAND.tagline} />
      <div className="container-page max-w-3xl space-y-4 py-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Welcome to The Party World — your one-stop destination for making every celebration extra special! From
          beautiful balloons and party decorations to German silver return gifts and unique celebration essentials, we
          have everything you need to make your occasions memorable.
        </p>
        <p>
          Whether it&apos;s a birthday, anniversary, baby shower, wedding, or any special event, we&apos;re here to add
          more colour, joy, and happiness to your celebrations.
        </p>
        <p>
          Visit us at Poorna Market, Visakhapatnam - 530001, Andhra Pradesh, or call {BRAND.phoneDisplay} for bulk and
          event orders.
        </p>
      </div>
    </ShopLayout>
  );
}
