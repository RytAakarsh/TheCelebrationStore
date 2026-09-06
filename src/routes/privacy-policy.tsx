import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vizag Party World" },
      { name: "description", content: "How Vizag Party World collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Vizag Party World" },
      { property: "og:description", content: "Your data and how we protect it." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      sections={[
        {
          heading: "Information we collect",
          body: "We collect your name, email, phone number and delivery address so we can process and deliver your orders.",
        },
        {
          heading: "How we use it",
          body: "Your details are used only for order processing, delivery, customer support and order-related communication.",
        },
        {
          heading: "Data protection",
          body: "Your account data is stored securely and is accessible only to you and our authorised store team.",
        },
        {
          heading: "Contact",
          body: `For privacy requests, email ${BRAND.email} or call ${BRAND.phoneDisplay}.`,
        },
      ]}
    />
  ),
});
