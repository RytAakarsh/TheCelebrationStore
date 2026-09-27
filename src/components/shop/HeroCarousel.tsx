import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

export const HERO_SLIDES = [
  {
    id: "hero-1",
    src: "/assets/celebrationstore_1_hero.png",
    alt: "The Celebration Store — Everything for Life's Celebrations. Birthdays, Weddings, Gifting, Decorations & More.",
    link: "/shop",
    badge: "Everything for Celebrations",
  },
  {
    id: "hero-2",
    src: "/assets/celebrationstore_2_hero.png",
    alt: "Beautiful Return Gifts — Make your guests remember the celebration long after it ends.",
    link: "/category/return-gifts",
    badge: "Return Gifts Boutique",
  },
  {
    id: "hero-3",
    src: "/assets/celebrationstore_3_hero.png",
    alt: "Party Essentials from ₹45 — Balloons, candles, lights and props for every celebration.",
    link: "/offers",
    badge: "Party Essentials from ₹45",
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 25 },
    [Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section aria-label="Celebration highlights" className="container-page pt-3 sm:pt-4">
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(17,27,46,0.06)] border border-[#EFE8DC] bg-white">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {HERO_SLIDES.map((slide, index) => (
              <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full">
                <Link
                  to={slide.link as never}
                  aria-label={slide.alt}
                  className="block relative w-full overflow-hidden transition-opacity hover:opacity-[0.98]"
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    width={1536}
                    height={512}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    // @ts-expect-error fetchpriority is a modern standard attribute
                    fetchpriority={index === 0 ? "high" : "auto"}
                    className="w-full h-auto aspect-[16/7] sm:aspect-[21/8] md:aspect-[2.8/1] object-cover sm:object-contain bg-[#FFFDF8]"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous slide"
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 grid h-8 w-8 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/90 text-[#111B2E] shadow-md border border-[#EAE1CF] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-gold hover:scale-105 active:scale-95 z-10"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next slide"
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 grid h-8 w-8 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/90 text-[#111B2E] shadow-md border border-[#EAE1CF] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-gold hover:scale-105 active:scale-95 z-10"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === i
                  ? "w-6 bg-[image:var(--gradient-gold)] shadow-xs"
                  : "w-2 bg-white/70 hover:bg-white"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
