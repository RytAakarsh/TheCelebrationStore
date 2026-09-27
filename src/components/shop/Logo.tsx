import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const LOGO_TRANSPARENT = "/the-celebration-store-logo-transparent.png";
export const LOGO_FULL = "/the-celebration-store-logo.png";

interface LogoProps {
  className?: string;
  variant?: "header" | "footer" | "mobile" | "admin" | "icon-only" | "full";
  height?: number;
}

export function Logo({ className, variant = "header", height }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${BRAND.name} Home`}
      className={cn(
        "inline-flex items-center transition-transform hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-gold rounded-xl",
        variant === "footer" && "bg-white/95 rounded-2xl p-2 shadow-sm border border-gold/20",
        variant === "admin" && "bg-white/95 rounded-lg p-1.5 shadow-sm",
        className
      )}
    >
      <img
        src={variant === "footer" ? LOGO_FULL : LOGO_TRANSPARENT}
        alt={`${BRAND.name} — ${BRAND.tagline}`}
        className={cn(
          "w-auto object-contain select-none",
          variant === "header" && "h-9 sm:h-11 md:h-12 max-w-[140px] sm:max-w-[180px] md:max-w-[210px]",
          variant === "mobile" && "h-8 sm:h-9 max-w-[130px]",
          variant === "footer" && "h-11 sm:h-12 max-w-[180px]",
          variant === "admin" && "h-8 sm:h-9 max-w-[140px]",
          variant === "icon-only" && "h-9 w-9 object-cover rounded-full",
          variant === "full" && "h-12 sm:h-14 max-w-[220px]"
        )}
        style={height ? { height: `${height}px`, maxHeight: `${height}px` } : undefined}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
