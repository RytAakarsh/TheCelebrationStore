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
    try {
      const recent: string[] = JSON.parse(localStorage.getItem("vpw_recent_searches") ?? "[]");
      localStorage.setItem("vpw_recent_searches", JSON.stringify([q, ...recent.filter((r) => r !== q)].slice(0, 6)));
    } catch {
      // ignore storage error
    }
    navigate({ to: "/search", search: { q } });
  }

  return (
    <form role="search" onSubmit={submit} className={cn("relative w-full", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
        <input
          id="site-search"
          type="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-[#E6DDCA] bg-white pl-10 pr-24 text-sm text-[#111B2E] shadow-sm outline-none transition-all placeholder:text-muted-foreground/80 focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
        <button
          type="submit"
          className="absolute right-1.5 h-8.5 rounded-full bg-[image:var(--gradient-gold)] px-4 text-xs font-bold text-[#111B2E] shadow-sm transition hover:brightness-105 active:scale-95"
        >
          Search
        </button>
      </div>
    </form>
  );
}
