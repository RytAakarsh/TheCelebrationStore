import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ShopFilterState = {
  sort: string;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  inStockOnly?: boolean | undefined;
  minDiscount?: number | undefined;
};


const SORTS = [
  { value: "relevance", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "bestselling", label: "Bestselling" },
];

export function FilterBar({
  value,
  onChange,
  total,
}: {
  value: ShopFilterState;
  onChange: (next: ShopFilterState) => void;
  total: number;
}) {
  const set = (patch: Partial<ShopFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="sticky top-[68px] z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:top-[128px] lg:mx-0 lg:rounded-xl lg:border lg:px-4">
      <span className="mr-auto text-xs font-semibold text-muted-foreground">{total} products</span>

      <Select value={value.sort} onValueChange={(v) => set({ sort: v })}>
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="soft" size="sm" className="h-9">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 p-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wide">Price range (₹)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={value.minPrice ?? ""}
                  onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={value.maxPrice ?? ""}
                  onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wide">Discount</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 20, 30, 50].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set({ minDiscount: value.minDiscount === d ? undefined : d })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      value.minDiscount === d ? "border-pink bg-pink text-primary-foreground" : "border-border"
                    }`}
                  >
                    {d}% and above
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!value.inStockOnly}
                onCheckedChange={(c) => set({ inStockOnly: c === true })}
              />
              In stock only
            </label>

            <Button
              variant="soft"
              className="w-full"
              onClick={() => onChange({ sort: value.sort })}
            >
              Clear filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
