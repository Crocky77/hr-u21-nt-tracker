import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Named export (da radi: import { supabase } ...)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default export (da radi: import supabase from ...)
export default supabase;
