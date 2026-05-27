import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

/**
 * Supabase client for Route Handlers that must read/write auth cookies on the
 * same NextResponse (signup PKCE verifier + callback code exchange).
 */
export async function createRouteHandlerClient(
  response: NextResponse,
): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // cookieStore.set can throw in some server contexts; response still works.
          }
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
