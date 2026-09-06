import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { BRAND } from "@/lib/brand";

const faqs = [
  { q: "Do you deliver across Visakhapatnam?", a: "Yes, we deliver across Visakhapatnam and nearby areas. Delivery timelines are shared at checkout." },
  { q: "Do you take bulk or event orders?", a: `Absolutely. Call or WhatsApp ${BRAND.phoneDisplay} for bulk pricing and complete event decoration setups.` },
  { q: "What payment methods do you accept?", a: "Cash on Delivery is available now. Online payment will be enabled soon." },
  { q: "Can I visit the store?", a: "Yes — Party World, Poorna Market, Visakhapatnam - 530001, Andhra Pradesh." },
  { q: "What if a product is damaged?", a: "Contact us within 24 hours of delivery with photos and we will arrange a replacement or refund." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Vizag Party World" },
      { name: "description", content: "Answers about delivery, bulk orders, payments and returns at Vizag Party World." },
      { property: "og:title", content: "FAQ — Vizag Party World" },
      { property: "og:description", content: "Common questions about shopping with us." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <ShopLayout>
      <PageHeader title="Frequently Asked Questions" />
      <div className="container-page max-w-3xl py-6">
        <Accordion type="single" collapsible>
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ShopLayout>
  );
}
