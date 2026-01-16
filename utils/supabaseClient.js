// utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail-fast poruka u buildu ako env fali (bolje nego mystery #130)
if (!supabaseUrl || !supabaseAnonKey) {
  // NE bacamo error na import-u (da ne sruši SSR odmah), nego u runtime-u kad se koristi.
  // Ali ostavimo upozorenje.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
