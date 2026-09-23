import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bots = [
  { key: 'lia-campus', name: 'Lia Campus', handle: '@lia_campus', course: 'Comunicação', personality: 'acolhedora', interests: ['eventos', 'amizades', 'campus'], bio: 'Fala sobre eventos e integração no campus.', color: '8b5cf6' },
  { key: 'caio-estudos', name: 'Caio Estudos', handle: '@caio_estudos', course: 'Engenharia', personality: 'prático', interests: ['estudos', 'provas', 'biblioteca'], bio: 'Compartilha dicas de organização acadêmica.', color: '06b6d4' },
  { key: 'nina-eventos', name: 'Nina Eventos', handle: '@nina_eventos', course: 'Administração', personality: 'entusiasmada', interests: ['eventos', 'atléticas', 'cultura'], bio: 'Descobre e divulga atividades do campus.', color: 'ec4899' },
  { key: 'rafa-tech', name: 'Rafa Tech', handle: '@rafa_tech', course: 'Computação', personality: 'curioso', interests: ['tecnologia', 'projetos', 'hackathons'], bio: 'Conversa sobre projetos e tecnologia.', color: '10b981' },
  { key: 'bia-bem-estar', name: 'Bia Bem-estar', handle: '@bia_bemestar', course: 'Psicologia', personality: 'reflexiva', interests: ['bem-estar', 'rotina', 'apoio'], bio: 'Incentiva uma rotina acadêmica mais saudável.', color: 'f59e0b' },
];

const postTemplates = [
  'O que está acontecendo no campus esta semana? Vamos compartilhar dicas de eventos e espaços legais para estudar.',
  'Uma rotina acadêmica fica mais leve quando a gente troca materiais e combina um horário de estudo.',
  'Tem evento, palestra ou atividade cultural chegando? Marca aqui para a comunidade conhecer.',
  'Projeto de faculdade também pode começar com uma conversa simples no campus. Quem está procurando parceria?',
  'Lembrete de hoje: estudar é importante, mas fazer uma pausa e pedir apoio também faz parte.',
];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Autenticação obrigatória.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Sessão inválida.' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: operator, error: operatorError } = await admin
    .from('bot_operators').select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (operatorError || !operator) return json({ error: 'Apenas operadores autorizados podem ativar a demonstração.' }, 403);

  const { data: existingBots, error: existingError } = await admin
    .from('bot_profiles').select('bot_key, auth_user_id, display_name, handle, is_automated').order('created_at');
  if (existingError) return json({ error: existingError.message }, 500);

  const seeded: Array<{ name: string; handle: string; isAutomated: boolean }> = [];
  const createdIds: string[] = [];
  for (let index = 0; index < bots.length; index += 1) {
    const bot = bots[index];
    const already = existingBots?.find((row) => row.bot_key === bot.key);
    let authUserId = already?.auth_user_id;

    if (!authUserId) {
      const email = `${bot.key}@bots.unidate.local`;
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: crypto.randomUUID() + 'A!9',
        email_confirm: true,
        user_metadata: { displayName: bot.name, userType: 'aluno', isAutomated: true },
        app_metadata: { role: 'bot', botKey: bot.key },
      });
      if (createError) return json({ error: createError.message }, 500);
      authUserId = created.user?.id;
      if (authUserId) createdIds.push(authUserId);
    }
    if (!authUserId) return json({ error: `Não foi possível criar ${bot.name}.` }, 500);

    const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=${bot.color}&color=fff&size=160&bold=true`;
    const { error: profileError } = await admin.from('profiles').update({
      display_name: bot.name, course: bot.course, university: 'UniDate Campus',
      bio: bot.bio, interests: bot.interests, photo_url: photoUrl,
      onboarding_completed: true, is_verified: true,
    }).eq('id', authUserId);
    if (profileError) return json({ error: profileError.message }, 500);

    const { error: botError } = await admin.from('bot_profiles').upsert({
      auth_user_id: authUserId, bot_key: bot.key, display_name: bot.name,
      handle: bot.handle, bio: bot.bio, personality: bot.personality,
      interests: bot.interests, photo_url: photoUrl, is_automated: true, is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'bot_key' });
    if (botError) return json({ error: botError.message }, 500);

    const { count } = await admin.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', authUserId);
    if ((count ?? 0) === 0) {
      await admin.from('posts').insert({ author_id: authUserId, content: postTemplates[index], type: 'text', hashtags: ['campus', 'unidate'] });
    }
    seeded.push({ name: bot.name, handle: bot.handle, isAutomated: true });
  }

  // One short, clearly automated conversation in the public demo feed.
  const { data: botRows } = await admin.from('bot_profiles').select('auth_user_id').order('created_at').limit(5);
  const { data: firstPost } = await admin.from('posts').select('id, author_id').in('author_id', (botRows ?? []).map((row) => row.auth_user_id)).order('created_at').limit(1).maybeSingle();
  if (firstPost && botRows && botRows.length > 1) {
    const { count } = await admin.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', firstPost.id).eq('author_id', botRows[1].auth_user_id);
    if ((count ?? 0) === 0) await admin.from('comments').insert({ post_id: firstPost.id, author_id: botRows[1].auth_user_id, content: 'Conta automatizada aqui: eu também quero participar! #campus' });
  }

  return json({ ok: true, requestedBy: user.id, created: createdIds.length, bots: seeded });
});
