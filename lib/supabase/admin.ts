import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase client authenticated with the service role key.
 *
 * RLS on `orders` / `order_items` intentionally has no public UPDATE
 * policy (see /supabase/migrations) — guests can only INSERT and SELECT
 * their own order. Flipping `payment_status` to "paid" after a verified
 * Razorpay signature is a privileged action, so it goes through this
 * client instead of the anon client used elsewhere.
 *
 * Never import this file from a "use client" component — the service
 * role key must stay server-side only.
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[supabase admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. " +
        "Add SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API -> service_role) to .env.local."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
