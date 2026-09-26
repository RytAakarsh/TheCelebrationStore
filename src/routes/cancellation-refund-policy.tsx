import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/cancellation-refund-policy")({
  head: () => ({
    meta: [
      { title: `Cancellation & Refund Policy — ${BRAND.name}` },
      { name: "description", content: `How to cancel an order and how replacements and refunds are processed at ${BRAND.name}, Visakhapatnam.` },
      { property: "og:title", content: `Cancellation & Refund Policy — ${BRAND.name}` },
      { property: "og:description", content: "Cancellations, replacements and refunds explained clearly." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Cancellation & Refund Policy"
      sections={[
        {
          heading: "1. Order Cancellations",
          body: `• Standard Orders: You may request cancellation anytime prior to dispatch by messaging or calling our helpline at +91 ${BRAND.phone}.\n• Custom / Personalized Items: Once customized printing or personalization work has commenced, cancellation cannot be accommodated.`,
        },
        {
          heading: "2. Damaged, Defective, or Incorrect Items",
          body: `We take immense pride in carefully packaging each celebration item. In the rare event an item arrives damaged or incorrect:\n• Please notify us via WhatsApp (+91 ${BRAND.phone}) or email (${BRAND.email}) within 24 hours of delivery.\n• Provide your Order Number along with a brief photo or unboxing video of the affected items.\n• We will immediately dispatch a free replacement or issue a full refund.`,
        },
        {
          heading: "3. Refund Method & Processing Time",
          body: `• Online Payments: Refunds will be credited back to your original payment method (Bank Account / UPI / Card) within 5-7 working days.\n• Cash on Delivery (COD): Refunds will be issued via direct UPI transfer or store credit upon verification.`,
        },
        {
          heading: "4. Return Shipping Guidelines",
          body: "For verified defective or wrong shipments, we arrange reverse pickup or reimburse return shipping costs. Items must be returned in their original packaging and unused condition.",
        },
        {
          heading: "5. Contact Customer Support",
          body: `For immediate assistance with returns or refunds, please reach out to our team at ${BRAND.email} or call +91 ${BRAND.phone} (Poorna Market, Visakhapatnam).`,
        },
      ]}
    />
  ),
});
