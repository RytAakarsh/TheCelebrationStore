import { Link } from "@tanstack/react-router";
import logo from "@/assets/vpw-logo.png.asset.json";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <Link to="/" aria-label={`${BRAND.name} home`} className={cn("flex shrink-0 items-center gap-2", className)}>
      <img
        src={logo.url}
        alt={`${BRAND.name} logo`}
        width={size}
        height={size}
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
