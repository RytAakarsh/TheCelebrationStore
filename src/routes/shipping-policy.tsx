import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Vizag Party World" },
      { name: "description", content: "Delivery areas, timelines and shipping charges for Vizag Party World orders." },
      { property: "og:title", content: "Shipping Policy — Vizag Party World" },
      { property: "og:description", content: "How and when your celebration order reaches you." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Shipping Policy"
      sections={[
        {
          heading: "Delivery areas",
          body: "We deliver across Visakhapatnam and surrounding areas. For other locations, contact us before ordering.",
        },
        {
          heading: "Timelines",
          body: "Orders are usually dispatched within 1-2 working days. Balloons, decorations and bulk event items may need additional preparation time.",
        },
        {
          heading: "Charges",
          body: "Shipping charges are shown before you place the order and free delivery may apply above a minimum order value.",
        },
        {
          heading: "Help",
          body: `For urgent or same-day requirements, call ${BRAND.phoneDisplay}.`,
        },
      ]}
    />
  ),
});
