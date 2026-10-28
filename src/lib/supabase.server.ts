import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceSupabase() {
  if (serviceClient) return serviceClient;

  const url = process.env.SUPABASE_URL || "https://njbtlcdyknuwwltunfis.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_KZlJvSQBrBds76bSb0o0OA_R4pb3mWh";

  serviceClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}
