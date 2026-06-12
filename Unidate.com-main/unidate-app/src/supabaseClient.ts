import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xrwsmsqxqzqzqmyjqcwt.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd3NteHF4cXpycXpxbXlqY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTI2MzIsImV4cCI6MjA5Njc4ODYzMn0.0ffZLjC111RAT5WZnRuIiVVCiUGerEd77me1dk6kN7A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
