import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vxuwuepqoyzopngcyexd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('⚠️ REACT_APP_SUPABASE_ANON_KEY não foi configurada no arquivo .env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
