import { Link, useRouterState } from "@tanstack/react-router";
import { Grid2x2, Heart, Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: Grid2x2 },
  { to: "/search", label: "Search", icon: Search },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Quick mobile navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 surface-navy shadow-lg pt-1 lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to as never}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                  active ? "text-gold font-bold" : "text-cream/70 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110 text-gold")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
