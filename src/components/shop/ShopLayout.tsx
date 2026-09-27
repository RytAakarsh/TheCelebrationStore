import type { ReactNode, ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { whatsappLink } from "@/lib/brand";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF8]">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white shadow-lift border-2 border-white/80 transition-all duration-300 hover:scale-110 hover:bg-emerald-500 active:scale-95 lg:bottom-6"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="border-b border-[#EDE7DC] bg-[#FFF8ED]">
      <div className="container-page py-6 sm:py-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                {b.to ? (
                  <Link to={b.to as never} className="hover:text-gold transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#111B2E]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#111B2E]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="container-page py-16 text-center">
      {Icon && (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-gold border border-gold/20 shadow-xs">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#111B2E]">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
