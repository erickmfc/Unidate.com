import React, { useEffect, useState } from 'react';
import { Activity, Bot, CheckCircle2, Clock3, Pause, Play, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import SimpleAdminLayout from '../../components/Admin/Layout/SimpleAdminLayout';
import { BotActivityLog, BotAutomationSettings, DemoBotProfile, botAutomationService } from '../../services/botAutomationService';
import { useUniDateToast } from '../../components/UI/Toast';

const PERSONA_KEYS = ['lara-saquarema', 'julia-saquarema', 'marina-saquarema', 'sofia-saquarema', 'beatriz-saquarema', 'camila-saquarema', 'isabela-saquarema', 'renata-saquarema', 'paula-saquarema'];

const AutomatedActivityPage: React.FC = () => {
  const { showError, showSuccess } = useUniDateToast();
  const [settings, setSettings] = useState<BotAutomationSettings | null>(null);
  const [bots, setBots] = useState<DemoBotProfile[]>([]);
  const [logs, setLogs] = useState<BotActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = async () => {
    try {
      const [nextSettings, nextBots, nextLogs] = await Promise.all([
        botAutomationService.getAutomationSettings(),
        botAutomationService.listDemoBots(),
        botAutomationService.listActivityLogs(),
      ]);
      setSettings(nextSettings);
      setBots(nextBots);
      setLogs(nextLogs);
    } catch (error: any) {
      showError(error?.message || 'Não foi possível carregar a atividade automatizada.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveSettings = async (patch: Partial<BotAutomationSettings>) => {
    if (!settings) return;
    setWorking(true);
    try {
      const saved = await botAutomationService.updateAutomationSettings({
        intensity: patch.intensity ?? settings.intensity,
        is_enabled: patch.is_enabled ?? settings.is_enabled,
        posts_enabled: patch.posts_enabled ?? settings.posts_enabled,
        comments_enabled: patch.comments_enabled ?? settings.comments_enabled,
        require_approval: patch.require_approval ?? settings.require_approval,
        paused_until: patch.paused_until ?? settings.paused_until,
      });
      setSettings(saved);
      showSuccess('Configuração da automação atualizada.');
    } catch (error: any) { showError(error?.message || 'Não foi possível salvar a configuração.'); }
    finally { setWorking(false); }
  };

  const provisionAll = async () => {
    setWorking(true);
    try {
      for (const key of PERSONA_KEYS) await botAutomationService.provisionCampusPersona(key);
      await load();
      showSuccess('As quatro personagens foram cadastradas individualmente.');
    } catch (error: any) { showError(error?.message || 'Não foi possível cadastrar todas as personagens.'); }
    finally { setWorking(false); }
  };

  const runNow = async () => {
    setWorking(true);
    try {
      const result = await botAutomationService.runAutomationNow();
      await load();
      showSuccess(result.action === 'skip' ? 'Nenhuma ação foi escolhida neste ciclo.' : `Ação executada: ${result.action}.`);
    } catch (error: any) { showError(error?.message || 'Não foi possível executar o ciclo.'); }
    finally { setWorking(false); }
  };

  const toggleBot = async (bot: DemoBotProfile) => {
    try {
      await botAutomationService.updateBotProfileSettings(bot.bot_key, { is_active: !bot.is_active });
      await load();
    } catch (error: any) { showError(error?.message || 'Não foi possível atualizar a personagem.'); }
  };

  if (loading || !settings) return <SimpleAdminLayout><div className="p-8 text-gray-300">Carregando atividade automatizada...</div></SimpleAdminLayout>;

  return (
    <SimpleAdminLayout>
      <div className="min-h-screen bg-gray-900 p-6 text-gray-100 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-600/20 p-3"><Bot className="h-8 w-8 text-violet-300" /></div>
            <div><h1 className="text-2xl font-bold">Atividade Automatizada</h1><p className="text-sm text-gray-400">Personagens virtuais do campus • Saquarema</p></div>
          </div>
          <button onClick={provisionAll} disabled={working} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-500 disabled:opacity-50"><Sparkles className="h-4 w-4" /> Cadastrar personagens</button>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          As contas são identificadas publicamente como <strong>personagens virtuais</strong>. O painel mostra o histórico técnico, os limites e a intensidade de cada uma.
        </div>

        <section className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-gray-800 p-5 lg:col-span-2">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-400">Intensidade geral</p><h2 className="text-lg font-semibold">{settings.is_enabled ? 'Automação ativa' : 'Automação pausada'}</h2></div><Activity className="h-6 w-6 text-emerald-400" /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['off', 'low', 'normal', 'high', 'custom'] as const).map((intensity) => <button key={intensity} onClick={() => void saveSettings({ intensity, is_enabled: intensity !== 'off' })} className={`rounded-lg px-3 py-2 text-sm font-medium ${settings.intensity === intensity ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{({ off: 'Desligado', low: 'Baixa', normal: 'Normal', high: 'Alta', custom: 'Personalizada' } as any)[intensity]}</button>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm"><button onClick={() => void saveSettings({ is_enabled: !settings.is_enabled })} className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 hover:bg-gray-600">{settings.is_enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{settings.is_enabled ? 'Pausar todos' : 'Ativar todos'}</button><button onClick={() => void runNow()} disabled={working} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 hover:bg-emerald-600 disabled:opacity-50"><RefreshCw className="h-4 w-4" /> Executar um ciclo</button></div>
          </div>
          <label className="rounded-2xl bg-gray-800 p-5"><span className="text-sm text-gray-400">Posts automáticos</span><div className="mt-3 flex items-center gap-3"><input type="checkbox" checked={settings.posts_enabled} onChange={(e) => void saveSettings({ posts_enabled: e.target.checked })} className="h-5 w-5 accent-violet-600" /><span>{settings.posts_enabled ? 'Permitidos' : 'Bloqueados'}</span></div></label>
          <label className="rounded-2xl bg-gray-800 p-5"><span className="text-sm text-gray-400">Comentários automáticos</span><div className="mt-3 flex items-center gap-3"><input type="checkbox" checked={settings.comments_enabled} onChange={(e) => void saveSettings({ comments_enabled: e.target.checked })} className="h-5 w-5 accent-violet-600" /><span>{settings.comments_enabled ? 'Permitidos' : 'Bloqueados'}</span></div></label>
        </section>

        <section className="rounded-2xl bg-gray-800 p-5"><div className="mb-4 flex items-center gap-2"><Settings2 className="h-5 w-5 text-violet-300" /><h2 className="text-lg font-semibold">Por personagem</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bots.filter((bot) => bot.bot_key !== 'erick-campus').map((bot) => <article key={bot.bot_key} className="rounded-xl border border-gray-700 bg-gray-900 p-4"><div className="flex items-center gap-3"><img src={bot.photo_url || '/api/placeholder/64/64'} alt={bot.display_name} className="h-12 w-12 rounded-full object-cover" /><div className="min-w-0"><h3 className="truncate font-semibold">{bot.display_name}</h3><p className="truncate text-xs text-gray-400">{bot.institution} • {bot.course}</p></div></div><p className="mt-3 text-xs text-gray-400">{bot.public_disclosure || 'Personagem virtual'} • {bot.city || 'Saquarema'}</p><div className="mt-3 flex items-center justify-between text-sm"><span className={bot.is_active ? 'text-emerald-300' : 'text-gray-500'}>{bot.is_active ? 'Ativa' : 'Pausada'}</span><button onClick={() => void toggleBot(bot)} className="rounded-lg bg-gray-700 px-3 py-1.5 hover:bg-gray-600">{bot.is_active ? 'Pausar' : 'Ativar'}</button></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400"><span>Posts/dia: {bot.daily_post_limit ?? 1}</span><span>Comentários: {bot.daily_comment_limit ?? 1}</span><span>Iniciativa: {bot.initiative_level ?? 'normal'}</span><span>Resposta: {Math.round((bot.response_probability ?? 0) * 100)}%</span></div></article>)}
        </div></section>

        <section className="rounded-2xl bg-gray-800 p-5"><div className="mb-4 flex items-center gap-2"><Clock3 className="h-5 w-5 text-violet-300" /><h2 className="text-lg font-semibold">Histórico de decisões</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase text-gray-500"><tr><th className="px-3 py-2">Horário</th><th className="px-3 py-2">Personagem</th><th className="px-3 py-2">Ação</th><th className="px-3 py-2">Decisão</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-gray-700"><td className="px-3 py-2 text-gray-400">{new Date(log.created_at).toLocaleString('pt-BR')}</td><td className="px-3 py-2">{log.bot_key}</td><td className="px-3 py-2"><span className="inline-flex items-center gap-1">{log.action === 'skip' ? <Clock3 className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}{log.action}</span></td><td className="px-3 py-2 text-gray-400">{log.decision_reason || log.content || '—'}</td></tr>)}</tbody></table>{logs.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Ainda não há decisões registradas.</p>}</div></section>
      </div>
    </SimpleAdminLayout>
  );
};

export default AutomatedActivityPage;
