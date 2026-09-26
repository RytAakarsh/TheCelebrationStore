import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { MessageSquare, Phone, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Where is The Celebration Store physically located?",
    a: `Our physical store is located at ${BRAND.address}. You are welcome to visit us Monday to Sunday between 9:30 AM to 9:00 PM to inspect our extensive collections of balloons, decorations, and German silver return gifts in person.`
  },
  {
    q: "Do you offer delivery across Visakhapatnam and other cities in India?",
    a: "Yes! We provide prompt local delivery across Visakhapatnam (including MVP Colony, Gajuwaka, Madhurawada, Rushikonda, Pendurthi, Seethammadhara, Jagadamba, etc.) and courier dispatch across Andhra Pradesh, Telangana, and all over India."
  },
  {
    q: "What is your shipping charge and free shipping policy?",
    a: "We offer FREE Standard Delivery on all orders of ₹999 and above! For orders below ₹999, a nominal flat delivery charge of ₹79 is applied at checkout."
  },
  {
    q: "Do you accept bulk orders for return gifts and wedding celebrations?",
    a: `Yes, bulk gifting is one of our key specialities! We supply German silver pooja items, return gift pouches, luxury party favor boxes, and celebration kits in wholesale quantities. Contact our direct helpline at +91 ${BRAND.phone} or WhatsApp us for customized bulk quotations.`
  },
  {
    q: "What payment methods are supported on your store?",
    a: "We support Cash on Delivery (COD) for local addresses, as well as secure online payments including UPI (Google Pay, PhonePe, Paytm), Debit & Credit Cards, and Net Banking."
  },
  {
    q: "Can I customize return gift bags and balloon decor themes?",
    a: "Yes! We offer themed customization for birthdays, baby showers, half-saree ceremonies, weddings, housewarmings, and festive events. Message our team on WhatsApp with your theme requirements."
  },
  {
    q: "What is your cancellation and refund policy if an item arrives damaged?",
    a: "If any item arrives damaged or missing, simply share an unboxing photo or video on our WhatsApp support (+91 8019926065) within 24 hours of receipt. We will promptly issue an instant replacement or refund."
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ & Help Center — ${BRAND.name}` },
      { name: "description", content: `Frequently asked questions about orders, deliveries, bulk return gifts, and party supplies at ${BRAND.name}, Visakhapatnam.` },
      { property: "og:title", content: `FAQ & Help Center — ${BRAND.name}` },
      { property: "og:description", content: "Frequently asked questions about shopping with us." },
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
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about deliveries, bulk return gifts, payments and celebration planning."
      />
      <div className="container-page max-w-3xl py-8">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`faq-${i}`}
              className="rounded-xl border border-border bg-card px-4 shadow-xs"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-gold hover:no-underline py-4">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions */}
        <div className="mt-10 rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold mb-3">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">Have more questions or need custom event assistance?</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Our team in Poorna Market, Visakhapatnam is always delighted to assist you in planning your celebrations.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <a href={BRAND.whatsappUrl("Hi! I have a question about celebration products")} target="_blank" rel="noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">
                <Phone className="mr-2 h-4 w-4" /> Contact Store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
