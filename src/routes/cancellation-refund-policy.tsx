import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/cancellation-refund-policy")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — Vizag Party World" },
      { name: "description", content: "How to cancel an order and how refunds are processed at Vizag Party World." },
      { property: "og:title", content: "Cancellation & Refund Policy — Vizag Party World" },
      { property: "og:description", content: "Cancellations, replacements and refunds explained." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Cancellation & Refund Policy"
      sections={[
        {
          heading: "Cancellations",
          body: "Orders can be cancelled before dispatch by calling or messaging us. Customised and bulk event orders cannot be cancelled once preparation has started.",
        },
        {
          heading: "Damaged or wrong items",
          body: "Report damaged or incorrect items within 24 hours of delivery with photographs and we will arrange a replacement.",
        },
        {
          heading: "Refunds",
          body: "Approved refunds are processed within 5-7 working days to the original payment method, or as store credit for cash on delivery orders.",
        },
        {
          heading: "Contact",
          body: `Write to ${BRAND.email} or call ${BRAND.phoneDisplay} for any refund query.`,
        },
      ]}
    />
  ),
});
