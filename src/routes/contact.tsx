import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { BRAND, whatsappLink } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Vizag Party World — Poorna Market, Visakhapatnam" },
      {
        name: "description",
        content:
          "Call 8019926065, WhatsApp us or visit Party World, Poorna Market, Visakhapatnam - 530001 for party supplies and event decoration.",
      },
      { property: "og:title", content: "Contact Vizag Party World" },
      { property: "og:description", content: "Reach our Poorna Market store in Visakhapatnam." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <ShopLayout>
      <PageHeader title="Contact Us" subtitle="We'd love to help plan your celebration" />
      <div className="container-page grid gap-4 py-6 sm:grid-cols-2">
        <div className="card-product p-5">
          <h2 className="font-display text-lg font-bold">Visit our store</h2>
          <address className="mt-2 space-y-1 text-sm not-italic text-muted-foreground">
            {BRAND.addressLines.map((l) => (
              <span key={l} className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {l}
              </span>
            ))}
          </address>
        </div>
        <div className="card-product space-y-3 p-5">
          <h2 className="font-display text-lg font-bold">Talk to us</h2>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gold" />
            <a href={`tel:+91${BRAND.phone}`} className="hover:text-pink">{BRAND.phoneDisplay}</a>
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gold" />
            <a href={`mailto:${BRAND.email}`} className="break-all hover:text-pink">{BRAND.email}</a>
          </p>
          <Button asChild variant="hero" size="lg" className="w-full">
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
