// lib/supabase/server.ts
// Use this inside Server Components, Route Handlers, and Server Actions.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore if you
            // have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// lib/supabase/admin.ts pattern (separate file in practice):
// Only ever import this in server-only code (Route Handlers / Server Actions).
// It uses the SERVICE ROLE key and bypasses RLS — needed for admin writes
// (creating products) and trusted order/payment operations.
//
// import { createClient as createAdminClient } from "@supabase/supabase-js";
// export function createAdmin() {
//   return createAdminClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { persistSession: false } }
//   );
// }