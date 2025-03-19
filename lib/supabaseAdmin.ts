import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase Admin client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false, // Admin client does not need session storage
    },
  }
);
