import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseEnabled = process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false";
let singleton: SupabaseClient<Database> | null = null;

function getRealtimeClient() {
  if (!supabaseEnabled) {
    throw new Error("Realtime channel requested but Supabase is disabled.");
  }

  if (singleton) return singleton;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  singleton = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return singleton;
}

export function sessionChannel(sessionId: string): RealtimeChannel {
  const client = getRealtimeClient();
  return client.channel(`session:${sessionId}`);
}
