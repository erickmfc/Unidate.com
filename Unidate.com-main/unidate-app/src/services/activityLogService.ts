import { supabase } from '../supabaseClient';

export type SiteActivityAction = 'login' | 'logout' | 'page_view';
export type EventActivityAction =
  | 'view'
  | 'rsvp_going'
  | 'rsvp_maybe'
  | 'rsvp_cancelled'
  | 'created'
  | 'shared';

/** Activity logging must never block the action the user is taking. */
export async function logSiteActivity(
  userId: string,
  action: SiteActivityAction,
  pagePath?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('site_activity_logs').insert({
      user_id: userId,
      action,
      page_path: pagePath || null,
    });
    if (error) console.warn('Não foi possível registrar atividade do site:', error.message);
  } catch (error) {
    console.warn('Não foi possível registrar atividade do site:', error);
  }
}

export async function logEventActivity(
  userId: string,
  eventId: string,
  action: EventActivityAction
): Promise<void> {
  if (eventId.startsWith('mock_') || eventId.startsWith('local_')) return;

  try {
    const { error } = await supabase.from('event_activity_logs').insert({
      user_id: userId,
      event_id: eventId,
      action,
    });
    if (error) console.warn('Não foi possível registrar atividade do evento:', error.message);
  } catch (error) {
    console.warn('Não foi possível registrar atividade do evento:', error);
  }
}
