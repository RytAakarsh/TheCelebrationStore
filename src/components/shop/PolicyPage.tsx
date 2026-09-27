import { ShopLayout, PageHeader } from "./ShopLayout";

export function PolicyPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <ShopLayout>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: title }]}
      />
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-sm space-y-6">
          {sections.map((s) => (
            <section key={s.heading} className="space-y-2 border-b border-border/60 pb-5 last:border-b-0 last:pb-0">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#111B2E]">{s.heading}</h2>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
