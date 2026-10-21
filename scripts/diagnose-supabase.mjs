import { createClient } from "@supabase/supabase-js";
import fs from "fs";

let envVars = {};
try {
  const content = fs.readFileSync(".env", "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^['"](.*)['"]$/, "$1").trim();
    }
  }
} catch (e) {}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || "https://njbtlcdyknuwwltunfis.supabase.co";
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_KZlJvSQBrBds76bSb0o0OA_R4pb3mWh";

console.log("Connecting to Supabase at:", SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnose() {
  console.log("\n1. Testing public queries...");
  const { data: prods, error: prodErr } = await supabase.from("products").select("id,name").limit(2);
  console.log("Products query:", { count: prods?.length, error: prodErr?.message });

  console.log("\n2. Testing site_settings...");
  const { data: settings, error: setErr } = await supabase.from("site_settings").select("*").maybeSingle();
  console.log("Site settings:", { settings, error: setErr?.message });

  console.log("\n3. Testing signup behavior with dummy email...");
  const testEmail = `aakarsh.test.${Date.now()}@gmail.com`;
  const testPassword = `Pass_${Date.now()}!Aa1`;
  const { data: signupData, error: signupErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: "Test Customer" }
    }
  });

  console.log("SignUp response:", {
    user: signupData?.user ? { id: signupData.user.id, email: signupData.user.email, confirmed_at: signupData.user.confirmed_at, identities: signupData.user.identities?.length } : null,
    hasSession: Boolean(signupData?.session),
    error: signupErr ? { message: signupErr.message, status: signupErr.status } : null
  });

  console.log("\n4. Testing signInWithPassword on unconfirmed user...");
  const { data: signinData, error: signinErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  console.log("SignIn response on unconfirmed email:", {
    hasSession: Boolean(signinData?.session),
    error: signinErr ? { message: signinErr.message, status: signinErr.status } : null
  });
}

diagnose().catch(console.error);
