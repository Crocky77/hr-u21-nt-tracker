import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Backward-compatible alias:
 * Neki fileovi u projektu importaju { supabaseClient } ili "supabaseClient".
 * Ovo sprječava build error:
 * "Attempted import error: 'supabaseClient' is not exported..."
 */
export const supabaseClient = supabase;

export default supabase;
