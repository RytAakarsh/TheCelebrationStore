import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  autoFocus,
  initial = "",
  placeholder = "Search balloons, return gifts, wedding decor...",
}: {
  className?: string;
  autoFocus?: boolean;
  initial?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    const recent: string[] = JSON.parse(localStorage.getItem("vpw_recent_searches") ?? "[]");
    localStorage.setItem("vpw_recent_searches", JSON.stringify([q, ...recent.filter((r) => r !== q)].slice(0, 6)));
    navigate({ to: "/search", search: { q } });
  }

  return (
    <form role="search" onSubmit={submit} className={cn("relative w-full", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="site-search"
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-20 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-[image:var(--gradient-festive)] px-3 text-xs font-bold text-primary-foreground"
      >
        Search
      </button>
    </form>
  );
}
