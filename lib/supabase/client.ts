import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn rather than throw: Phase 0's placeholder page doesn't touch
  // Supabase yet, so the app should still run before .env.local is filled in.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
      "Copy .env.local.example to .env.local and fill in your Supabase project values before Phase 1."
  );
}

// Browser client for this demo — no auth, permissive table policies.
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);
