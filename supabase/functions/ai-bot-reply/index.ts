import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return json({ error: 'AI_PROVIDER_NOT_CONFIGURED' }, 503);
  const { message, botName, personality, history = [] } = await req.json();
  if (typeof message !== 'string' || !message.trim()) return json({ error: 'Mensagem inválida.' }, 400);
  const messages = [
    { role: 'system', content: `Você é ${botName || 'um estudante do UniDate'}, uma personagem universitária transparente e respeitosa. Personalidade: ${personality || 'acolhedora'}. Responda em português brasileiro, em no máximo 3 frases. Não invente fatos sobre eventos, notas, pessoas ou campus. Quando faltar contexto, diga isso e faça uma pergunta. Não dê aconselhamento médico, jurídico ou financeiro. Não diga que é uma pessoa real.` },
    ...Array.isArray(history) ? history.slice(-6).filter((item: any) => item?.role && item?.content).map((item: any) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content).slice(0, 500) })) : [],
    { role: 'user', content: message.slice(0, 1000) },
  ];
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini', messages, temperature: 0.5, max_tokens: 180 }) });
  if (!response.ok) return json({ error: 'AI_PROVIDER_ERROR' }, 502);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return json({ error: 'AI_EMPTY_RESPONSE' }, 502);
  return json({ content: String(content).trim() });
});
