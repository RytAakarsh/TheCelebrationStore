import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/shop/SafeImage";

export const LOGO_SRC = "/assets/vpw-logo.png";

export function Logo({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <Link to="/" aria-label={`${BRAND.name} home`} className={cn("flex shrink-0 items-center gap-2", className)}>
      <SafeImage
        src={LOGO_SRC}
        alt={`${BRAND.name} logo`}
        width={size}
        height={size}
        loading="eager"
        className="rounded-lg object-contain"
        style={{ width: size, height: size }}
      />
      <span className="hidden min-w-0 flex-col leading-none sm:flex">
        <span className="font-display text-base font-bold tracking-tight">Vizag Party World</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
          {BRAND.tagline}
        </span>
      </span>
    </Link>
  );
}
