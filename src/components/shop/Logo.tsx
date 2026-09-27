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
        "inline-flex items-center transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-gold rounded-xl",
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
          variant === "header" && "h-11 sm:h-12 md:h-13 max-w-[175px] sm:max-w-[205px] md:max-w-[240px]",
          variant === "mobile" && "h-10 sm:h-11 max-w-[165px]",
          variant === "footer" && "h-12 sm:h-13 max-w-[190px]",
          variant === "admin" && "h-9 sm:h-10 max-w-[150px]",
          variant === "icon-only" && "h-10 w-10 object-cover rounded-full",
          variant === "full" && "h-14 sm:h-16 max-w-[240px]"
        )}
        style={height ? { height: `${height}px`, maxHeight: `${height}px` } : undefined}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
