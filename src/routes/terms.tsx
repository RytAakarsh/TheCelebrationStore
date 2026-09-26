import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions — ${BRAND.name}` },
      { name: "description", content: `Terms and conditions for shopping with ${BRAND.name}, Poorna Market, Visakhapatnam.` },
      { property: "og:title", content: `Terms & Conditions — ${BRAND.name}` },
      { property: "og:description", content: "The terms that apply to orders placed with us." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms & Conditions"
      sections={[
        {
          heading: "1. Acceptance of Terms",
          body: `Welcome to ${BRAND.name}. By accessing our website, placing an order, or communicating with our store, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please contact our support team.`,
        },
        {
          heading: "2. Product Catalogue & Minimum Order Quantities",
          body: `We strive to display our party supplies, balloons, decor, and German silver return gifts as accurately as possible. Products may have a Minimum Order Quantity (MOQ) clearly indicated on the product page. All orders are subject to stock availability and pricing confirmation.`,
        },
        {
          heading: "3. Pricing & Taxes",
          body: "All prices listed on the store are in Indian National Rupees (INR ₹) and are inclusive of all applicable taxes. Shipping charges are calculated transparently during checkout based on order total.",
        },
        {
          heading: "4. Order Confirmation & Fulfillment",
          body: `Upon placing an order, you will receive an immediate confirmation with an Order ID. ${BRAND.name} reserves the right to decline or cancel orders in cases of pricing inaccuracies, stock discrepancies, or unserviceable delivery pin codes.`,
        },
        {
          heading: "5. Customer Conduct & Accuracy",
          body: "You agree to provide true, current, and complete delivery and contact information during checkout. Incorrect addresses or phone numbers may cause delivery delays or cancellation.",
        },
        {
          heading: "6. Customer Support & Grievances",
          body: `For any legal inquiries or questions regarding our terms, please email ${BRAND.email} or call our store helpline at +91 ${BRAND.phone} (${BRAND.address}).`,
        },
      ]}
    />
  ),
});
