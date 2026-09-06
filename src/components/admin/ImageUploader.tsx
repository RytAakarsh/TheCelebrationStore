import { useRef, useState } from "react";
import { Loader2, Upload, X, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeImage } from "@/components/shop/SafeImage";
import { uploadImage } from "@/lib/admin/upload";

export function ImageUploader({
  urls,
  onChange,
  max = 5,
  folder = "products",
  label = "Images",
}: {
  urls: string[];
  onChange: (next: string[]) => void;
  max?: number;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - urls.length;
    if (room <= 0) {
      toast.error(`You can add up to ${max} images.`);
      return;
    }
    setBusy(true);
    const next = [...urls];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        next.push(await uploadImage(file, folder));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    }
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => onChange(urls.filter((_, idx) => idx !== i));
  const makePrimary = (i: number) => {
    const next = [...urls];
    const [picked] = next.splice(i, 1);
    if (picked) next.unshift(picked);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {label} <span className="text-muted-foreground">({urls.length}/{max})</span>
        </p>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
            <SafeImage src={url} alt="" className="h-full w-full object-contain p-1" />
            {i === 0 && max > 1 && (
              <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                Main
              </span>
            )}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
              {i !== 0 && max > 1 && (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  aria-label="Make main image"
                  className="grid h-6 w-6 place-items-center rounded bg-background/90"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="ml-auto grid h-6 w-6 place-items-center rounded bg-background/90 text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="…or paste an image URL"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!manual.trim()) return;
            if (urls.length >= max) {
              toast.error(`You can add up to ${max} images.`);
              return;
            }
            onChange([...urls, manual.trim()]);
            setManual("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
