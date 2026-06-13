const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xrwsmxqxqzrqzqmyjcwt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd3NteHF4cXpycXpxbXlqY3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjYzMiwiZXhwIjoyMDk2Nzg4NjMyfQ.MM9d0AVFaHYQUgFMHZtkd4DMK3XPzWVmR_uvLRJXekw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function test() {
  console.log('Testing Supabase Connection...');
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles:', data);
  }
}

test();
