import { BadgeCheck, PackageCheck, Sparkles, Truck } from "lucide-react";

const items = [
  { icon: Truck, title: "Fast Local Delivery", text: "Quick dispatch across Visakhapatnam" },
  { icon: BadgeCheck, title: "Genuine Quality", text: "Handpicked celebration products" },
  { icon: PackageCheck, title: "Bulk & Event Orders", text: "Special pricing for large events" },
  { icon: Sparkles, title: "Festive Curation", text: "New arrivals every season" },
];

export function TrustBar() {
  return (
    <section className="container-page py-6">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="card-product flex items-start gap-3 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-gold)] text-gold-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{title}</span>
              <span className="block text-xs text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
