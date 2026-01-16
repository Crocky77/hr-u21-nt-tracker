// utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Ovo ne smije rušiti build, ali je korisno u devu.
  // Vercel ENV mora sadržavati NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY
  console.warn("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url || "", anon || "");

// Kompatibilnost: dio fileova import-a default, dio named
export default supabase;
