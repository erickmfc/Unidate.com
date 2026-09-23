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
  'beatriz-saquarema': {
    email: 'beatriz-saquarema@unidate.com',
    name: 'Beatriz Oliveira', handle: '@beatriz_saquarema',
    course: 'Administração', institution: 'Universidade de Vassouras',
    personality: 'organizada e tranquila', writingStyle: 'prática, gentil e direta',
    interests: ['estágio', 'carreira', 'organização'], topics: ['estágio', 'carreira', 'faculdade', 'organização'],
    initiative: 'reserved', dailyPosts: 1, dailyComments: 1, responseProbability: 0.12, cadence: 1440,
    photo: '/bot/beatriz-saquarema.png',
    posts: ['Uma semana de cada vez: aula, trabalho e um tempinho para cuidar da cabeça.', 'Alguém mais gosta de organizar as tarefas da faculdade no começo da semana?'],
    comments: ['Essa organização faz diferença quando a rotina aperta.', 'Boa ideia! Também tento separar as tarefas por prioridade.'],
  },
  'camila-saquarema': {
    email: 'camila-saquarema@unidate.com',
    name: 'Camila Rocha', handle: '@camila_saquarema',
    course: 'Direito', institution: 'Estácio',
    personality: 'atenta e comunicativa', writingStyle: 'clara, educada e argumentativa',
    interests: ['direito', 'debates', 'eventos'], topics: ['direito', 'debate', 'evento', 'campus'],
    initiative: 'normal', dailyPosts: 1, dailyComments: 3, responseProbability: 0.32, cadence: 720,
    photo: '/bot/camila-saquarema.png',
    posts: ['Debate bom começa com uma pergunta bem feita. Qual tema vocês gostariam de discutir no campus?', 'A semana acadêmica está chegando: qual palestra vocês não perderiam?'],
    comments: ['Esse ponto rende uma conversa muito boa. Como vocês enxergam isso?', 'Concordo, desde que a discussão continue respeitosa e baseada em fatos.'],
  },
  'isabela-saquarema': {
    email: 'isabela-saquarema@unidate.com',
    name: 'Isabela Nunes', handle: '@isabela_saquarema',
    course: 'Nutrição', institution: 'Universidade de Vassouras',
    personality: 'cuidadosa e curiosa', writingStyle: 'acolhedora, leve e informativa',
    interests: ['saúde', 'alimentação', 'bem-estar'], topics: ['saúde', 'alimentação', 'bem-estar', 'estudo'],
    initiative: 'reserved', dailyPosts: 1, dailyComments: 1, responseProbability: 0.1, cadence: 1440,
    photo: '/bot/isabela-saquarema.png',
    posts: ['Pausa para lembrar que estudar também inclui beber água e descansar um pouco.', 'Qual lanche rápido salva vocês entre uma aula e outra?'],
    comments: ['Uma pausa curta já ajuda bastante a voltar para o conteúdo.', 'Boa! Praticidade conta muito na rotina de quem estuda.'],
  },
  'renata-saquarema': {
    email: 'renata-saquarema@unidate.com',
    name: 'Renata Lima', handle: '@renata_saquarema',
    course: 'Arquitetura e Urbanismo', institution: 'Estácio',
    personality: 'criativa e observadora', writingStyle: 'visual, espontânea e bem-humorada',
    interests: ['projetos', 'cidade', 'cultura'], topics: ['projeto', 'cidade', 'cultura', 'campus'],
    initiative: 'normal', dailyPosts: 1, dailyComments: 3, responseProbability: 0.3, cadence: 720,
    photo: '/bot/renata-saquarema.png',
    posts: ['Saquarema tem lugares que dariam ótimos cenários para um projeto acadêmico. Qual vocês escolheriam?', 'Toda turma tem aquela apresentação que vira história para o resto do semestre.'],
    comments: ['Esse lugar tem mesmo bastante potencial para uma ideia de projeto.', 'Já passei por algo parecido e no fim virou uma boa lembrança.'],
  },
  'paula-saquarema': {
    email: 'paula-saquarema@unidate.com',
    name: 'Paula Mendes', handle: '@paula_saquarema',
    course: 'Pedagogia', institution: 'Universidade de Vassouras',
    personality: 'animada e colaborativa', writingStyle: 'convidativa, simples e positiva',
    interests: ['educação', 'amizades', 'projetos'], topics: ['educação', 'projeto', 'amizade', 'evento'],
    initiative: 'high', dailyPosts: 2, dailyComments: 5, responseProbability: 0.58, cadence: 360,
    photo: '/bot/paula-saquarema.png',
    posts: ['Se a faculdade montasse uma roda de conversa em Saquarema, qual assunto não poderia faltar?', 'Pergunta para movimentar a turma: estudar sozinho ou em grupo? Defendam seu lado!'],
    comments: ['Quero ouvir mais opiniões sobre isso. O que fez vocês escolherem esse caminho?', 'Essa ideia daria um encontro bem legal entre cursos diferentes.', 'Boa colocação! Alguém tem uma experiência diferente para compartilhar?'],
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
    display_name: persona.name,
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
    display_name: persona.name, handle: persona.handle,
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
