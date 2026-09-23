import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, Check, Clock3, Pause, Play, RefreshCw, Send, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { AIBotService } from '../../../services/aiBotService';
import { HumorCandidate, HumorGeneratorService } from '../../../services/humorGeneratorService';
import { botAutomationService } from '../../../services/botAutomationService';
import { useUniDateToast } from '../../UI/Toast';

type BotMode = 'manual' | 'semi_automatic' | 'automatic';
interface BotSettings { mode: BotMode; is_paused: boolean; posts_per_day: number; window_start: string; window_end: string; irony_level: number; average_length: number; auto_replies: boolean; }
const defaults: BotSettings = { mode: 'manual', is_paused: true, posts_per_day: 4, window_start: '08:00', window_end: '23:30', irony_level: 45, average_length: 120, auto_replies: false };

const HumorBotPanel: React.FC = () => {
  const { showSuccess, showError } = useUniDateToast();
  const [settings, setSettings] = useState<BotSettings>(defaults);
  const [candidate, setCandidate] = useState<HumorCandidate | null>(null);
  const [ideas, setIdeas] = useState<HumorCandidate[]>([]);
  const [memory, setMemory] = useState<Array<{ text: string; topic: string; format: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profileReady, setProfileReady] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: config }, recentMemory] = await Promise.all([
        supabase.from('bot_settings').select('mode,is_paused,posts_per_day,window_start,window_end,irony_level,average_length,auto_replies').eq('id', true).maybeSingle(),
        HumorGeneratorService.getMemory(10).catch(() => []),
      ]);
      if (config) setSettings({ ...defaults, ...config });
      setMemory(recentMemory);
      const { data: profiles } = await supabase.from('bot_profiles').select('id').eq('is_active', true).limit(1);
      setProfileReady(Boolean(profiles?.length));
    } catch (error) {
      console.error('Erro ao carregar configurações do personagem:', error);
      showError('Não foi possível carregar as configurações do bot.');
    } finally { setLoading(false); }
  }, [showError]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (settings.mode !== 'automatic' || settings.is_paused || settings.posts_per_day < 1) return undefined;
    let cancelled = false;
    let timeout: number | undefined;
    const schedule = () => {
      const averageMs = (24 * 60 * 60 * 1000) / settings.posts_per_day;
      const randomizedMs = averageMs * (0.75 + Math.random() * 0.5);
      timeout = window.setTimeout(async () => {
        if (cancelled) return;
        try { await AIBotService.createAIPost(); showSuccess('Publicação automática criada.'); }
        catch (error) { console.error('Erro na publicação automática:', error); }
        schedule();
      }, randomizedMs);
    };
    schedule();
    return () => { cancelled = true; if (timeout) window.clearTimeout(timeout); };
  }, [settings.mode, settings.is_paused, settings.posts_per_day, showSuccess]);

  const saveSettings = async (next: BotSettings) => {
    setSettings(next);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('bot_settings').update({ ...next, updated_by: user?.id || null, updated_at: new Date().toISOString() }).eq('id', true);
    if (error) { showError('Não foi possível salvar a configuração.'); return; }
    showSuccess('Configuração do personagem salva.');
  };

  const generate = async () => { setBusy(true); try { setCandidate(await AIBotService.generateCandidate()); } catch { showError('Não foi possível gerar uma ideia.'); } finally { setBusy(false); } };
  const generateIdeas = async () => { setBusy(true); try { const next = await Promise.all(Array.from({ length: 10 }, () => AIBotService.generateCandidate())); setIdeas(next); setCandidate(next[0]); } catch { showError('Não foi possível gerar as ideias.'); } finally { setBusy(false); } };
  const publish = async () => { if (!candidate) return; setBusy(true); try { await AIBotService.publishCandidate(candidate); setMemory(await HumorGeneratorService.getMemory(10).catch(() => memory)); setCandidate(null); showSuccess('Publicação feita pelo personagem.'); } catch (error: any) { showError(error.message || 'Não foi possível publicar.'); } finally { setBusy(false); } };
  const createCharacter = async () => { setBusy(true); try { await botAutomationService.seedDemoBots(); setProfileReady(true); showSuccess('Personagem criado.'); await load(); } catch (error) { console.error(error); showError('Não foi possível criar o personagem agora.'); } finally { setBusy(false); } };
  const modeLabel = useMemo(() => ({ manual: 'Manual', semi_automatic: 'Semiautomático', automatic: 'Automático' }[settings.mode]), [settings.mode]);

  if (loading) return <div className="rounded-xl bg-white p-8 text-center text-gray-500">Carregando personagem...</div>;
  return <div className="space-y-6">
    <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-600 p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><Bot className="h-8 w-8" /></div><div><h2 className="text-2xl font-bold">UniDate sem contexto</h2><p className="text-violet-100">@unidatesemcontexto · universitário cansado observando o caos</p></div></div>
        <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">{settings.is_paused ? 'PAUSADO' : 'ATIVO'} · {modeLabel}</span>
      </div>
    </div>
    {!profileReady && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><p className="font-semibold">O personagem ainda não está criado no Supabase.</p><p className="mt-1 text-sm">Crie o perfil automatizado uma vez para publicar no feed com o autor correto.</p><button onClick={createCharacter} disabled={busy} className="mt-3 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Criar personagem</button></div>}
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Memória recente</p><p className="mt-1 text-3xl font-bold text-gray-900">{memory.length}</p><p className="text-xs text-gray-400">últimas publicações</p></div><div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Meta diária</p><p className="mt-1 text-3xl font-bold text-gray-900">{settings.posts_per_day}</p><p className="text-xs text-gray-400">entre {settings.window_start} e {settings.window_end}</p></div><div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Anti-repetição</p><p className="mt-1 text-3xl font-bold text-emerald-600"><Check className="inline h-7 w-7" /> ativo</p><p className="text-xs text-gray-400">memória por tema e formato</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-xl bg-white p-6 shadow"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-violet-600" />Gerador e aprovação</h3><button onClick={load} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Atualizar"><RefreshCw className="h-4 w-4" /></button></div><div className="flex flex-wrap gap-2"><button onClick={generate} disabled={busy} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Gerar ideia</button><button onClick={generateIdeas} disabled={busy} className="rounded-lg border border-violet-200 px-4 py-2 font-semibold text-violet-700 disabled:opacity-50">Gerar 10 ideias</button></div>{candidate && <div className="mt-5 rounded-xl border-2 border-violet-100 bg-violet-50 p-5"><p className="whitespace-pre-wrap text-lg leading-7 text-gray-900">{candidate.text}</p><div className="mt-4 flex flex-wrap gap-2 text-xs text-violet-700"><span className="rounded-full bg-white px-2 py-1">{candidate.topic}</span><span className="rounded-full bg-white px-2 py-1">{candidate.format}</span><span className="rounded-full bg-white px-2 py-1">score interno {Math.round(candidate.score)}</span></div><div className="mt-4 flex gap-2"><button onClick={publish} disabled={busy} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />Publicar</button><button onClick={generate} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2">Regenerar</button><button onClick={() => setCandidate(null)} className="rounded-lg border border-gray-300 px-4 py-2">Descartar</button></div></div>}{ideas.length > 1 && <div className="mt-4 space-y-2">{ideas.slice(1).map((idea, index) => <button key={`${idea.text}-${index}`} onClick={() => setCandidate(idea)} className="block w-full rounded-lg border border-gray-200 p-3 text-left text-sm hover:border-violet-400">{idea.text.replace(/\n/g, ' · ')}</button>)}</div>}</section>
      <section className="rounded-xl bg-white p-6 shadow"><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Settings2 className="h-5 w-5 text-violet-600" />Agendamento</h3><label className="mb-4 block text-sm font-medium text-gray-700">Modo<select value={settings.mode} onChange={e => void saveSettings({ ...settings, mode: e.target.value as BotMode })} className="mt-1 w-full rounded-lg border-gray-300"><option value="manual">Manual</option><option value="semi_automatic">Semiautomático</option><option value="automatic">Automático</option></select></label><label className="mb-4 block text-sm font-medium text-gray-700">Posts por dia ({settings.posts_per_day})<input type="range" min="0" max="8" value={settings.posts_per_day} onChange={e => setSettings({ ...settings, posts_per_day: Number(e.target.value) })} onMouseUp={() => void saveSettings(settings)} className="mt-2 w-full" /></label><div className="mb-4 grid grid-cols-2 gap-3"><label className="text-sm font-medium text-gray-700">Início<input type="time" value={settings.window_start} onChange={e => setSettings({ ...settings, window_start: e.target.value })} onBlur={() => void saveSettings(settings)} className="mt-1 w-full rounded-lg border-gray-300" /></label><label className="text-sm font-medium text-gray-700">Fim<input type="time" value={settings.window_end} onChange={e => setSettings({ ...settings, window_end: e.target.value })} onBlur={() => void saveSettings(settings)} className="mt-1 w-full rounded-lg border-gray-300" /></label></div><label className="mb-5 flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={settings.auto_replies} onChange={e => void saveSettings({ ...settings, auto_replies: e.target.checked })} />responder comentários automaticamente</label><button onClick={() => void saveSettings({ ...settings, is_paused: !settings.is_paused })} className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white ${settings.is_paused ? 'bg-emerald-600' : 'bg-amber-600'}`}>{settings.is_paused ? <><Play className="h-4 w-4" />Ativar personagem</> : <><Pause className="h-4 w-4" />Pausar personagem</>}</button></section>
    </div>
    <section className="rounded-xl bg-white p-6 shadow"><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Clock3 className="h-5 w-5 text-violet-600" />Memória do personagem</h3>{memory.length === 0 ? <p className="text-sm text-gray-500">Nenhuma publicação registrada ainda.</p> : <div className="divide-y divide-gray-100">{memory.map(item => <div key={`${item.text}-${item.topic}`} className="py-3"><p className="whitespace-pre-wrap text-sm text-gray-800">{item.text}</p><p className="mt-1 text-xs text-gray-400">{item.topic} · {item.format}</p></div>)}</div>}</section>
  </div>;
};

export default HumorBotPanel;
