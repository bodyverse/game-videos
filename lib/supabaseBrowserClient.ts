import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export function supabaseBrowserClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "true") {
    throw new Error("Supabase browser client requested but Supabase is disabled.");
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createPagesBrowserClient<Database>();
  }

  throw new Error("Supabase browser client environment variables are missing.");
}
