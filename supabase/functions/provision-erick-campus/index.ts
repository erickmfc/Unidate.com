import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const bot = {
  key: 'erick-campus',
  // Use a syntactically valid domain so Supabase Auth can create the service account.
  email: 'erick-campus@unidate.com',
  name: 'Erick Campus · BOT',
  handle: '@erick_campus_bot',
  course: 'Desenvolvimento de Sistemas',
  university: 'UniDate Campus',
  personality: 'descontraído',
  interests: ['faculdade', 'projetos', 'campus'],
  bio: 'Perfil automatizado de demonstração do UniDate. Compartilha a rotina universitária aos poucos e conversa sobre projetos de faculdade.',
  photoUrl: 'https://unidate-com.vercel.app/bot/erick-campus-1.png',
  photoGallery: [
    'https://unidate-com.vercel.app/bot/erick-campus-2.png',
    'https://unidate-com.vercel.app/bot/erick-campus-3.png',
    'https://unidate-com.vercel.app/bot/erick-campus-4.png',
  ],
};

async function handle(req: Request) {
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
  const { data: operator } = await admin
    .from('bot_operators').select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (!operator) return json({ error: 'Apenas operadores autorizados podem cadastrar o bot.' }, 403);

  const { data: existingBot } = await admin
    .from('bot_profiles').select('auth_user_id').eq('bot_key', bot.key).maybeSingle();
  let authUserId = existingBot?.auth_user_id as string | undefined;

  if (!authUserId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: bot.email,
      password: `${crypto.randomUUID()}-Bot!9`,
      email_confirm: true,
      user_metadata: {
        displayName: bot.name,
        userType: 'aluno',
        university: bot.university,
        course: bot.course,
        photoURL: bot.photoUrl,
        isAutomated: true,
      },
      app_metadata: { role: 'bot', botKey: bot.key },
    });
    if (createError) return json({ error: createError.message }, 500);
    authUserId = created.user?.id;
  }
  if (!authUserId) return json({ error: 'Não foi possível criar o perfil automatizado.' }, 500);

  const { error: profileError } = await admin.from('profiles').update({
    display_name: bot.name,
    course: bot.course,
    university: bot.university,
    bio: bot.bio,
    interests: bot.interests,
    photo_url: bot.photoUrl,
    onboarding_completed: true,
    is_verified: true,
  }).eq('id', authUserId);
  if (profileError) return json({ error: profileError.message }, 500);

  const { error: botError } = await admin.from('bot_profiles').upsert({
    auth_user_id: authUserId,
    bot_key: bot.key,
    display_name: bot.name,
    handle: bot.handle,
    bio: bot.bio,
    personality: bot.personality,
    interests: bot.interests,
    photo_url: bot.photoUrl,
    photo_gallery: bot.photoGallery,
    is_automated: true,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'bot_key' });
  if (botError) return json({ error: botError.message }, 500);

  return json({ ok: true, created: !existingBot, bot: { name: bot.name, handle: bot.handle, isAutomated: true } });
}

Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('provision-erick-campus failed', message);
    // Keep the response readable by the authenticated UI while preserving the
    // manual session and operator checks above.
    return json({ ok: false, error: message }, 200);
  }
});
