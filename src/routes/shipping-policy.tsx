import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: `Shipping & Delivery Policy — ${BRAND.name}` },
      { name: "description", content: `Delivery areas, express timelines and shipping rates for ${BRAND.name} orders across Visakhapatnam and India.` },
      { property: "og:title", content: `Shipping & Delivery Policy — ${BRAND.name}` },
      { property: "og:description", content: "How and when your celebration order reaches you." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Shipping & Delivery Policy"
      sections={[
        {
          heading: "1. Serviceable Delivery Areas",
          body: `We provide local delivery across Visakhapatnam (including Poorna Market, MVP Colony, Gajuwaka, Madhurawada, Rushikonda, Pendurthi, Jagadamba, Seethammadhara, and surrounding areas) as well as courier dispatch throughout Andhra Pradesh and all major Indian cities.`,
        },
        {
          heading: "2. Shipping Charges & Free Delivery",
          body: `• Orders ₹999 and above enjoy FREE Standard Delivery.\n• For orders below ₹999, a nominal flat shipping fee of ₹79 is applied at checkout.\n• Bulk event or oversized decor shipments may have customized freight quotes communicated in advance.`,
        },
        {
          heading: "3. Dispatch & Delivery Timelines",
          body: `• Standard In-Stock Orders: Dispatched within 24-48 hours. Estimated delivery within Visakhapatnam is 1-2 business days, and 3-5 business days for other regions across India.\n• Custom Celebration Hampers & Return Gifts: Handcrafted to order; dispatched within 2-3 business days.`,
        },
        {
          heading: "4. Urgent / Same-Day Delivery in Vizag",
          body: `Need party decor urgently for today's event? Reach out to our store directly on WhatsApp (+91 ${BRAND.phone}) to arrange instant local courier / Dunzo / Porter delivery within Visakhapatnam.`,
        },
        {
          heading: "5. Order Tracking",
          body: "Once your order is confirmed and dispatched, you can track its real-time progress through your Account Dashboard or by contacting our WhatsApp support with your Order Number.",
        },
      ]}
    />
  ),
});
