import { ShopLayout, PageHeader } from "./ShopLayout";

export function PolicyPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <ShopLayout>
      <PageHeader title={title} />
      <div className="container-page max-w-3xl space-y-5 py-6">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-lg font-bold">{s.heading}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </ShopLayout>
  );
}
