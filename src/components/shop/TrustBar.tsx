import { Sparkles, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";

const items = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    text: "Celebration essentials curated with care",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Flat ₹79 shipping • Free over ₹999",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Store",
    text: "Poorna Market, Visakhapatnam",
  },
  {
    icon: MessageCircle,
    title: "Easy Support",
    text: `WhatsApp assistance (${BRAND.phone})`,
  },
];

export function TrustBar() {
  return (
    <section className="container-page py-6 sm:py-8">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="card-product flex items-center gap-3.5 p-3.5 sm:p-4 bg-gradient-to-r from-white to-[#FFF8ED] border border-[#EDE7DC]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-gold)] text-[#111B2E] shadow-sm">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-gold">{title}</span>
              <span className="block text-xs text-[#23314D]/80 font-medium leading-tight mt-0.5">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
