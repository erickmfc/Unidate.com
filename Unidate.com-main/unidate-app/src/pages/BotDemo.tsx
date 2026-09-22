import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { botAutomationService, DemoBotProfile } from '../services/botAutomationService';
import { useUniDateToast } from '../components/UI/Toast';

const BotDemo: React.FC = () => {
  const { showError, showSuccess } = useUniDateToast();
  const [bots, setBots] = useState<DemoBotProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadBots = async () => {
    try { setBots(await botAutomationService.listDemoBots()); }
    catch (error: any) { showError(error?.message || 'Não foi possível carregar os bots.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadBots(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await botAutomationService.seedDemoBots();
      await loadBots();
      showSuccess(`${result.created} conta(s) automatizada(s) criada(s) ou atualizada(s).`);
    } catch (error: any) { showError(error?.message || 'Não foi possível ativar a demonstração.'); }
    finally { setSeeding(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 text-white shadow-xl">
          <div className="mb-4 flex items-center gap-3"><Bot className="h-8 w-8" /><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">DEMO TCC</span></div>
          <h1 className="text-3xl font-bold">Bots de interação do campus</h1>
          <p className="mt-2 max-w-2xl text-violet-100">Cinco perfis automatizados para demonstrar conversas, comentários e conteúdo sobre a vida universitária. Todos são identificados como BOT.</p>
          <button onClick={handleSeed} disabled={seeding} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 shadow hover:bg-violet-50 disabled:opacity-60">
            {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            {seeding ? 'Ativando demonstração...' : 'Ativar / atualizar os 5 bots'}
          </button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div> : bots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">A demonstração ainda não foi ativada. Clique no botão acima.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => <article key={bot.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3"><img src={bot.photo_url || '/api/placeholder/64/64'} alt={bot.display_name} className="h-14 w-14 rounded-full" /><div><h2 className="font-bold text-slate-900">{bot.display_name}</h2><p className="text-sm text-slate-500">{bot.handle}</p></div></div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Conta automatizada identificada</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{bot.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">{bot.interests.map((interest) => <span key={interest} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700">#{interest}</span>)}</div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MessageCircle className="h-4 w-4" /> Personalidade: {bot.personality}</div>
            </article>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotDemo;
