import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const IMAGE_PLACEHOLDER = "/assets/placeholder.svg";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null | undefined;
  fallback?: string;
};

/**
 * Production-safe image: always renders a real file URL, never a build-tool
 * metadata pointer. Falls back to a branded placeholder when the file 404s.
 */
export function SafeImage({ src, alt = "", fallback = IMAGE_PLACEHOLDER, className, loading = "lazy", ...rest }: Props) {
  const initial = src && src.trim().length > 0 ? src : fallback;
  const [current, setCurrent] = useState(initial);
  const [key, setKey] = useState(initial);

  // keep in sync when the src prop changes
  if (initial !== key) {
    setKey(initial);
    setCurrent(initial);
  }

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cn(className)}
      onError={() => {
        if (current !== fallback) {
          console.error(`[image] failed to load: ${current}`);
          setCurrent(fallback);
        }
      }}
    />
  );
}
