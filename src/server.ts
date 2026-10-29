import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { handlePayuReturn, handlePayuWebhook } from "./server/payu-handler";

export function syncCloudflareEnv(env: unknown) {
  if (!env || typeof env !== "object") return;
  (globalThis as any).__CLOUDFLARE_ENV__ = env;

  if (typeof globalThis.process === "undefined") {
    (globalThis as any).process = { env: {} };
  } else if (!globalThis.process.env) {
    globalThis.process.env = {};
  }

  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    if (typeof value === "string") {
      try {
        process.env[key] = value;
      } catch {
        // Safe against frozen properties
      }
    }
  }

  // Cross-populate aliases so both standard and VITE_ prefixed keys are available
  const p = process.env;
  if (!p.SUPABASE_URL && p.VITE_SUPABASE_URL) p.SUPABASE_URL = p.VITE_SUPABASE_URL;
  if (!p.VITE_SUPABASE_URL && p.SUPABASE_URL) p.VITE_SUPABASE_URL = p.SUPABASE_URL;

  if (!p.SUPABASE_PUBLISHABLE_KEY && p.VITE_SUPABASE_PUBLISHABLE_KEY) {
    p.SUPABASE_PUBLISHABLE_KEY = p.VITE_SUPABASE_PUBLISHABLE_KEY;
  }
  if (!p.VITE_SUPABASE_PUBLISHABLE_KEY && p.SUPABASE_PUBLISHABLE_KEY) {
    p.VITE_SUPABASE_PUBLISHABLE_KEY = p.SUPABASE_PUBLISHABLE_KEY;
  }

  if (!p.SUPABASE_PROJECT_ID && p.VITE_SUPABASE_PROJECT_ID) {
    p.SUPABASE_PROJECT_ID = p.VITE_SUPABASE_PROJECT_ID;
  }
  if (!p.VITE_SUPABASE_PROJECT_ID && p.SUPABASE_PROJECT_ID) {
    p.VITE_SUPABASE_PROJECT_ID = p.SUPABASE_PROJECT_ID;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    syncCloudflareEnv(env);
    try {
      const url = new URL(request.url);

      // Handle PayU Hosted Checkout Return Callback (both GET and POST supported)
      if (url.pathname === "/api/payu/return") {
        return await handlePayuReturn(request);
      }

      // Handle PayU Server-to-Server Webhook
      if (url.pathname === "/api/payu/webhook") {
        return await handlePayuWebhook(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
