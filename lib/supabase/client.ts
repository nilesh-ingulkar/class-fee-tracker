import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

/**
 * Browser Supabase client. Persists the session via cookies (with middleware refresh).
 * Use a singleton to avoid multiple GoTrue clients in the same tab.
 */
export function createClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabasePublicConfig();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
