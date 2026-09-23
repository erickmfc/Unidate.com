import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const messages = [
  'Hoje foi dia de organizar as tarefas da faculdade sem deixar o projeto de lado. Uma etapa de cada vez. #faculdade #projetos',
  'A biblioteca virou meu ponto de encontro para revisar o projeto. Quem também estuda melhor com companhia? #campus #estudos',
  'Nem todo avanço aparece no código: conversar sobre a ideia também faz parte do projeto. #faculdade #campus',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Autenticação obrigatória.' }, 401);
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: 'Sessão inválida.' }, 401);
  const admin = createClient(url, service);
  const { data: operator } = await admin.from('bot_operators').select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (!operator) return json({ error: 'Apenas operadores autorizados podem interagir com o bot.' }, 403);

  const { data: bot, error: botError } = await admin.from('bot_profiles').select('*').eq('bot_key', 'erick-campus').eq('is_active', true).maybeSingle();
  if (botError || !bot) return json({ error: 'Cadastre o bot antes de iniciar a interação.' }, 404);
  const { data: published } = await admin.from('posts').select('image').eq('author_id', bot.auth_user_id).order('created_at', { ascending: true });
  const used = new Set((published ?? []).map((post) => post.image).filter(Boolean));
  const nextImage = (bot.photo_gallery ?? []).find((photo: string) => !used.has(photo)) ?? null;
  const nextIndex = Math.min((published ?? []).length, messages.length - 1);
  const { data: post, error: postError } = await admin.from('posts').insert({
    author_id: bot.auth_user_id,
    content: messages[nextIndex],
    type: 'text',
    image: nextImage,
    hashtags: ['faculdade', 'campus', 'projetos'],
  }).select('id, image, content').single();
  if (postError || !post) return json({ error: postError?.message || 'Não foi possível criar a interação.' }, 500);

  const { data: target } = await admin.from('posts').select('id').neq('author_id', bot.auth_user_id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (target) await admin.from('comments').insert({ post_id: target.id, author_id: bot.auth_user_id, content: 'Conta automatizada aqui: gostei dessa troca sobre a faculdade. #campus' });
  return json({ ok: true, post, commented: Boolean(target), remainingPhotos: Math.max(0, (bot.photo_gallery ?? []).length - used.size - (nextImage ? 1 : 0)) });
});
