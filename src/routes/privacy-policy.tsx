import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${BRAND.name}` },
      { name: "description", content: `How ${BRAND.name} collects, uses and protects your personal information.` },
      { property: "og:title", content: `Privacy Policy — ${BRAND.name}` },
      { property: "og:description", content: "Your data privacy and how we protect it." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      sections={[
        {
          heading: "1. Information We Collect",
          body: `When you browse, register, or place an order at ${BRAND.name}, we collect personal information such as your name, phone number, email address, and delivery location. We do not store sensitive credit card or net banking credentials on our servers.`,
        },
        {
          heading: "2. Purpose of Data Collection",
          body: "We use your details strictly to fulfill orders, process payments, provide delivery updates via SMS/WhatsApp, provide customer service, and occasionally notify you about festive collections if you opt-in.",
        },
        {
          heading: "3. Data Security & Storage",
          body: "We implement robust industry-standard encryption and security protocols via Supabase PostgreSQL and secure authentication tokens. Your personal data is never sold or rented to third-party marketing companies.",
        },
        {
          heading: "4. Third-Party Service Providers",
          body: "We may share relevant delivery details (such as address and phone number) with verified local delivery partners and courier agencies solely to complete doorstep delivery of your celebrations.",
        },
        {
          heading: "5. Contacting Us About Privacy",
          body: `If you wish to update, review, or delete your account information, please contact our data privacy officer at ${BRAND.email} or call +91 ${BRAND.phone}.`,
        },
      ]}
    />
  ),
});
