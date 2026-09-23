import { supabase } from '../supabaseClient';

export const TERMS_VERSION = '2026-09-22';

export async function hasAcceptedTerms(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('terms_acceptances')
    .select('id')
    .eq('user_id', userId)
    .eq('terms_version', TERMS_VERSION)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function acceptTerms(userId: string): Promise<void> {
  const { error } = await supabase.from('terms_acceptances').insert({
    user_id: userId,
    terms_version: TERMS_VERSION,
    accepted_at: new Date().toISOString(),
  });

  // A retry or two tabs may reach the unique constraint at the same time.
  // In that case the terms are already accepted and the desired state is met.
  if (error && error.code !== '23505') throw error;
}
