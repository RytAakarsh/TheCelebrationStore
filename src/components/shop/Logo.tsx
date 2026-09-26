import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const LOGO_TRANSPARENT = "/the-celebration-store-logo.png";
export const LOGO_FULL = "/the-celebration-store-logo-full.png";

interface LogoProps {
  className?: string;
  variant?: "header" | "footer" | "admin" | "icon-only" | "full";
  height?: number;
}

export function Logo({ className, variant = "header", height }: LogoProps) {
  const defaultHeight =
    variant === "header"
      ? 48
      : variant === "footer"
        ? 52
        : variant === "admin"
          ? 38
          : 44;

  const h = height ?? defaultHeight;

  return (
    <Link
      to="/"
      aria-label={`${BRAND.name} Home`}
      className={cn("inline-flex items-center gap-2 transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-gold rounded-lg", className)}
    >
      <img
        src={LOGO_TRANSPARENT}
        alt={`${BRAND.name} - ${BRAND.tagline}`}
        className={cn(
          "w-auto max-w-[220px] sm:max-w-[260px] md:max-w-[300px] object-contain select-none",
          variant === "header" && "h-9 sm:h-11 md:h-12",
          variant === "footer" && "h-11 sm:h-14 bg-white/95 rounded-xl p-1.5 shadow-sm",
          variant === "admin" && "h-8 sm:h-9 bg-white/90 rounded-md p-1",
          variant === "icon-only" && "h-8 w-8 object-cover rounded-full",
          variant === "full" && "h-14 w-auto"
        )}
        style={{ maxHeight: `${h + 10}px` }}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
