import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Rated ${value} out of 5`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={i <= rounded ? "fill-gold text-gold" : "text-border"}
            aria-hidden
          />
        ))}
      </span>
      {count != null && <span className="text-xs text-muted-foreground">({count})</span>}
    </span>
  );
}
