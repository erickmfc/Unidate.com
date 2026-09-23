import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERSONAS = {
  'lara-saquarema': {
    email: 'lara-saquarema@unidate.com',
    name: 'Lara Fernandes', handle: '@lara_saquarema',
    course: 'Administração', institution: 'Universidade de Vassouras',
    personality: 'reservada e observadora', writingStyle: 'calma, objetiva e acolhedora',
    interests: ['organização', 'estágio', 'praia'], topics: ['estágio', 'organização', 'praia', 'faculdade'],
    initiative: 'reserved', dailyPosts: 1, dailyComments: 1, responseProbability: 0.08, cadence: 1440,
    photo: '/bot/lara-saquarema.png',
    posts: ['Checklist pronto para a semana: aula, estágio e um intervalo para respirar em Saquarema.', 'Organizar a semana no domingo deixa a segunda bem menos pesada.'],
    comments: ['Essa rotina de estágio e faculdade exige bastante organização. Boa sorte por aí!', 'Também gosto de separar as tarefas por blocos para não me perder.'],
  },
  'julia-saquarema': {
    email: 'julia-saquarema@unidate.com',
    name: 'Júlia Almeida', handle: '@julia_saquarema',
    course: 'Enfermagem', institution: 'Estácio',
    personality: 'atenciosa e prática', writingStyle: 'direta, gentil e cuidadosa',
    interests: ['saúde', 'provas', 'rotina'], topics: ['prova', 'estudo', 'saúde', 'faculdade'],
    initiative: 'reserved', dailyPosts: 1, dailyComments: 1, responseProbability: 0.1, cadence: 1440,
    photo: '/bot/julia-saquarema.png',
    posts: ['Dia de revisar o conteúdo antes da prova e tentar dormir cedo. A teoria também precisa de descanso.', 'A melhor parte de estudar em grupo é perceber que todo mundo tem uma dúvida diferente.'],
    comments: ['Boa! Revisar com calma costuma ajudar bastante antes da prova.', 'Essa troca de dúvidas deixa o estudo muito mais leve.'],
  },
  'marina-saquarema': {
    email: 'marina-saquarema@unidate.com',
    name: 'Marina Souza', handle: '@marina_saquarema',
    course: 'Psicologia', institution: 'Universidade de Vassouras',
    personality: 'curiosa e reflexiva', writingStyle: 'conversada, empática e curiosa',
    interests: ['bem-estar', 'amizades', 'cultura'], topics: ['bem-estar', 'amizade', 'campus', 'cultura'],
    initiative: 'normal', dailyPosts: 1, dailyComments: 3, responseProbability: 0.35, cadence: 720,
    photo: '/bot/marina-saquarema.png',
    posts: ['Qual hábito pequeno ajuda vocês a atravessar uma semana puxada de faculdade?', 'A conversa no intervalo às vezes ensina tanto quanto a aula.'],
    comments: ['Gostei desse ponto. O que fez mais diferença para você?', 'Isso combina com a rotina de muita gente no campus.'],
  },
  'sofia-saquarema': {
    email: 'sofia-saquarema@unidate.com',
    name: 'Sofia Martins', handle: '@sofia_saquarema',
    course: 'Sistemas de Informação', institution: 'Estácio',
    personality: 'ativa, bem-humorada e propositiva', writingStyle: 'leve, engraçada e questionadora',
    interests: ['tecnologia', 'projetos', 'eventos'], topics: ['projeto', 'tecnologia', 'evento', 'campus', 'estágio'],
    initiative: 'high', dailyPosts: 3, dailyComments: 6, responseProbability: 0.72, cadence: 240,
    photo: '/bot/sofia-saquarema.png',
    posts: ['Pergunta séria de campus: qual projeto da faculdade vocês defenderiam até no intervalo do ônibus?', 'Se a turma organizasse um encontro de projetos em Saquarema, qual ideia vocês levariam?', 'A apresentação deu certo, o código rodou e ninguém abriu o grupo da turma para reclamar. Vitória acadêmica.'],
    comments: ['Agora fiquei curiosa: como vocês resolveram essa parte?', 'Isso renderia uma conversa boa no campus. Quem mais já passou por isso?', 'Concordo com a ideia. Dá para transformar em um projeto bem legal.'],
  },
} as const;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const authorization = req.headers.get('Authorization');
  if (!authorization) return json({ error: 'Autenticação obrigatória.' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Sessão inválida.' }, 401);

  const admin = createClient(url, service);
  const { data: operator } = await admin.from('bot_operators').select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (!operator) return json({ error: 'Apenas operadores autorizados podem cadastrar personagens.' }, 403);

  const body = await req.json().catch(() => ({}));
  const botKey = String(body?.botKey ?? '');
  const persona = PERSONAS[botKey as keyof typeof PERSONAS];
  if (!persona) return json({ error: 'Personagem não encontrada.' }, 400);

  const { data: existing } = await admin.from('bot_profiles').select('auth_user_id').eq('bot_key', botKey).maybeSingle();
  let authUserId = existing?.auth_user_id as string | undefined;
  if (!authUserId) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: persona.email,
      password: `${crypto.randomUUID()}-Bot!9`,
      email_confirm: true,
      user_metadata: {
        displayName: persona.name,
        userType: 'aluno',
        university: persona.institution,
        course: persona.course,
        photoURL: `https://unidate-com.vercel.app${persona.photo}`,
        isAutomated: true,
      },
      app_metadata: { role: 'bot', botKey },
    });
    if (error) return json({ error: error.message }, 500);
    authUserId = created.user?.id;
  }
  if (!authUserId) return json({ error: 'Não foi possível criar a conta da personagem.' }, 500);

  const photoUrl = `https://unidate-com.vercel.app${persona.photo}`;
  const { error: profileError } = await admin.from('profiles').update({
    display_name: `${persona.name} · Personagem virtual`,
    course: persona.course,
    university: persona.institution,
    bio: `Personagem virtual de Saquarema. ${persona.personality}. ${persona.writingStyle}.`,
    interests: persona.interests,
    photo_url: photoUrl,
    onboarding_completed: true,
    is_verified: true,
  }).eq('id', authUserId);
  if (profileError) return json({ error: profileError.message }, 500);

  const { data: bot, error: botError } = await admin.from('bot_profiles').upsert({
    auth_user_id: authUserId, bot_key: botKey,
    display_name: `${persona.name} · Personagem virtual`, handle: persona.handle,
    bio: `Personagem virtual de Saquarema. ${persona.personality}. ${persona.writingStyle}.`,
    personality: persona.personality, interests: persona.interests,
    photo_url: photoUrl, photo_gallery: [], is_automated: true, is_active: true,
    city: 'Saquarema', institution: persona.institution,
    public_disclosure: 'Personagem virtual', writing_style: persona.writingStyle,
    topics: persona.topics, post_templates: persona.posts, comment_templates: persona.comments,
    initiative_level: persona.initiative, daily_post_limit: persona.dailyPosts,
    daily_comment_limit: persona.dailyComments, response_probability: persona.responseProbability,
    cadence_minutes: persona.cadence, next_action_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: 'bot_key' }).select('*').single();
  if (botError) return json({ error: botError.message }, 500);

  return json({ ok: true, created: !existing, bot });
});
