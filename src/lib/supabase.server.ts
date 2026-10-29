import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceSupabase() {
  if (serviceClient) return serviceClient;

  const cfEnv = (globalThis as any).__CLOUDFLARE_ENV__;
  const url =
    (typeof process !== "undefined" && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    cfEnv?.SUPABASE_URL ||
    cfEnv?.VITE_SUPABASE_URL ||
    "https://njbtlcdyknuwwltunfis.supabase.co";

  const key =
    (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) ||
    cfEnv?.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof process !== "undefined" && (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    cfEnv?.SUPABASE_PUBLISHABLE_KEY ||
    cfEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_KZlJvSQBrBds76bSb0o0OA_R4pb3mWh";

  serviceClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}
