import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl =
    env.SUPABASE_URL || env.VITE_SUPABASE_URL || "https://njbtlcdyknuwwltunfis.supabase.co";
  const supabasePublishableKey =
    env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_KZlJvSQBrBds76bSb0o0OA_R4pb3mWh";

  return {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart(),
      react(),
    ],
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(supabaseUrl),
      "process.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
      "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});
