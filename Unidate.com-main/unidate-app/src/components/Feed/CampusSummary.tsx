import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface CampusMetrics {
  teviToday: number;
  activePeople: number;
  eventsToday: number;
  interactionsToday: number;
}

const EMPTY_METRICS: CampusMetrics = {
  teviToday: 0,
  activePeople: 0,
  eventsToday: 0,
  interactionsToday: 0,
};

const CampusSummary: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(dayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const from = dayStart.toISOString();
    const to = tomorrow.toISOString();

    const loadMetrics = async () => {
      const [tevi, active, events, posts, likes, comments] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true })
          .eq('type', 'tevi').gte('created_at', from).lt('created_at', to),
        supabase.rpc('get_active_people_count'),
        supabase.from('events').select('id', { count: 'exact', head: true })
          .gte('date', from).lt('date', to),
        supabase.from('posts').select('id', { count: 'exact', head: true })
          .gte('created_at', from).lt('created_at', to),
        supabase.from('likes').select('post_id', { count: 'exact', head: true })
          .gte('created_at', from).lt('created_at', to),
        supabase.from('comments').select('id', { count: 'exact', head: true })
          .gte('created_at', from).lt('created_at', to),
      ]);

      if (cancelled) return;
      if (tevi.error || active.error || events.error || posts.error || likes.error || comments.error) {
        console.warn('Algumas métricas do campus não puderam ser carregadas:', { tevi: tevi.error, active: active.error, events: events.error, posts: posts.error, likes: likes.error, comments: comments.error });
      }
      setMetrics({
        teviToday: tevi.count || 0,
        activePeople: active.data || 0,
        eventsToday: events.count || 0,
        interactionsToday: (posts.count || 0) + (likes.count || 0) + (comments.count || 0),
      });
    };

    void loadMetrics().catch(error => console.error('Erro ao carregar resumo do campus:', error));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-extrabold text-slate-800 text-sm">Resumo do Campus</h3>
        <button onClick={() => navigate('/discover')} className="text-indigo-600 text-xs font-bold hover:underline">Ver tudo</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-pink-50/50 border border-pink-100/30 rounded-2xl p-3.5 text-center">
          <span className="text-sm font-bold text-pink-600 block">{metrics.teviToday}</span>
          <span className="text-[10px] text-slate-400 block font-semibold mt-1">#TeVi hoje</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100/30 rounded-2xl p-3.5 text-center">
          <span className="text-sm font-bold text-emerald-600 block">{metrics.activePeople}</span>
          <span className="text-[10px] text-slate-400 block font-semibold mt-1">Ativos (15 min)</span>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100/30 rounded-2xl p-3.5 text-center">
          <span className="text-sm font-bold text-indigo-600 block">{metrics.eventsToday}</span>
          <span className="text-[10px] text-slate-400 block font-semibold mt-1">Eventos hoje</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100/40">
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{metrics.interactionsToday}</span>
        <span>interações hoje (posts, curtidas e comentários)</span>
      </div>
    </div>
  );
};

export default CampusSummary;
