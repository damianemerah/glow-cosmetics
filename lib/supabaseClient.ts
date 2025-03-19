import { createClient } from "@/utils/supabase/client";
import { type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export const supabaseClient = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
})();
