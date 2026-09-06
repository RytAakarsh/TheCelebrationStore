import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Vizag Party World" },
      { name: "description", content: "Terms and conditions for shopping with Vizag Party World, Visakhapatnam." },
      { property: "og:title", content: "Terms & Conditions — Vizag Party World" },
      { property: "og:description", content: "The terms that apply to orders placed with us." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms & Conditions"
      sections={[
        {
          heading: "Orders",
          body: "All orders are subject to product availability and confirmation of pricing. Minimum order quantities shown on a product page apply to that product.",
        },
        {
          heading: "Pricing",
          body: "Prices are in Indian Rupees and inclusive of applicable taxes. We may update prices and offers at any time.",
        },
        {
          heading: "Use of the site",
          body: "You agree to provide accurate delivery details and to use this website only for lawful purposes.",
        },
        {
          heading: "Contact",
          body: `For any question about these terms, write to ${BRAND.email} or call ${BRAND.phoneDisplay}.`,
        },
      ]}
    />
  ),
});
