import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { heroBannersQuery } from "@/lib/queries";

export function HeroCarousel() {
  const { data: banners, isLoading } = useQuery(heroBannersQuery());

  if (isLoading) {
    return <div className="container-page py-4"><div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-secondary sm:aspect-[21/7]" /></div>;
  }
  if (!banners?.length) return null;

  return (
    <section aria-label="Featured offers" className="container-page pt-4">
      <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}>
        <CarouselContent>
          {banners.map((b) => (
            <CarouselItem key={b.id}>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={b.image_url}
                  alt={b.title ?? "Vizag Party World offer"}
                  className="aspect-[16/10] w-full object-cover sm:aspect-[21/8]"
                />
                <div className="absolute inset-0 bg-[image:var(--gradient-ink)]" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2 p-5 sm:p-10">
                  {b.title && (
                    <h2 className="max-w-md font-display text-2xl font-bold text-cream drop-shadow sm:text-4xl">
                      {b.title}
                    </h2>
                  )}
                  {b.subtitle && <p className="max-w-md text-sm text-cream/85 sm:text-base">{b.subtitle}</p>}
                  {b.cta_label && b.cta_link && (
                    <div className="mt-2">
                      <Button asChild variant="gold" size="lg">
                        <Link to={b.cta_link as never}>{b.cta_label}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 hidden sm:flex" />
        <CarouselNext className="right-3 hidden sm:flex" />
      </Carousel>
    </section>
  );
}
