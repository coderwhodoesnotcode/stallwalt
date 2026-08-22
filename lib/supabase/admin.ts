// lib/supabase/admin.ts
// SERVER-ONLY. Never import this in a Client Component or expose the
// service role key to the browser. Uses the service_role key, which
// bypasses Row Level Security — needed for:
//   - seeding/managing products from an admin tool
//   - creating orders + deducting stock atomically after payment succeeds
//   - webhook handlers (Stripe, etc.)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // keep in .env.local, never NEXT_PUBLIC_
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}