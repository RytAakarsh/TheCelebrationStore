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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qYnRsY2R5a251d3dsdHVuZmlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjIzNjg0NCwiZXhwIjoyMTA3ODEyODQ0fQ.w22WDa4vKDwP1mzNVBaeTAhHwHzMELZUL812vjEXk6E";

  serviceClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}
