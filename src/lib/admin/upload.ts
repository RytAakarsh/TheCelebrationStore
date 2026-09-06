import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "product-images";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// 10 years — the bucket is private (public buckets are disabled by workspace policy),
// so we persist a long-lived signed URL that works in any browser, including production.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed.`;
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name}: file is larger than 10 MB.`;
  return null;
}

/** Downscale large photos in the browser so uploads stay fast on mobile data. */
async function compress(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  if (typeof document === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder = "products"): Promise<string> {
  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);

  const body = await compress(file);
  const ext = body.type === "image/png" ? "png" : body.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: body.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data?.signedUrl) throw new Error(signErr?.message ?? "Could not create image link");
  return data.signedUrl;
}
