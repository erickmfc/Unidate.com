import React from 'react';
import Sidebar from '../components/Layout/Sidebar';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Lock, 
  Layers, 
  Share2,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Impulsionar: React.FC = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar no lado esquerdo */}
      <Sidebar />
      
      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-8 relative overflow-hidden">
        {/* Banner de Cabeçalho */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Impulsionar Campus</h1>
              <p className="text-slate-500">Monetização, publicidade inteligente e relevância para sua jornada</p>
            </div>
            {/* User Profile Header Badge */}
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
              <img 
                src={userProfile?.photoURL || '/api/placeholder/40/40'} 
                alt={userProfile?.displayName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <h4 className="text-sm font-semibold text-slate-700">{userProfile?.displayName || 'Matheus'}</h4>
                <p className="text-xs text-slate-400 truncate max-w-[120px]">{userProfile?.course || 'Estudante'}</p>
              </div>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="absolute right-0 top-0 transform translate-x-10 -translate-y-10 opacity-10">
              <Rocket className="h-96 w-96" />
            </div>
            
            <div className="max-w-xl relative z-10">
              <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                Nova Funcionalidade
              </span>
              <h2 className="text-3xl font-extrabold mt-4 mb-3 leading-tight">
                Amplifique sua voz e alcance milhares de estudantes
              </h2>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Descubra soluções de AdSense universitário para promover eventos, vender produtos, compartilhar serviços ou negociar participações internas.
              </p>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-xs w-fit">
                <Lock className="h-4 w-4 text-pink-300" />
                <span className="font-semibold text-pink-200">Em Desenvolvimento &bull; AdSense em Estudo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Funcionalidades Promocionais */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 pointer-events-none mb-12">
          {/* Card 1: Promover Posts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-64">
            <div>
              <div className="h-12 w-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Promover Publicações</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coloque suas postagens e fotos no topo do feed do campus por tempo determinado. Multiplique curtidas e interações.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Até 10x mais alcance</span>
          </div>

          {/* Card 2: Promover Eventos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-64">
            <div>
              <div className="h-12 w-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-500 mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Destacar Eventos</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Garanta que festas, hackathons ou workshops apareçam em "Próximos Eventos" na descoberta e recebam notificações de destaque.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Inscrições instantâneas</span>
          </div>

          {/* Card 3: AdSense & Ações */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-64">
            <div>
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">AdSense & Cotizações</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receba por anúncios exibidos no seu perfil ou invista/venda participações e créditos de ações dentro do ecossistema UniVerso.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Estudo de viabilidade comercial</span>
          </div>
        </div>

        {/* Painel Centralizado de "Em Breve" */}
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-md flex items-center justify-center z-10 p-4">
          <div className="bg-white p-8 rounded-[36px] shadow-2xl border border-slate-100 max-w-md w-full text-center flex flex-col items-center space-y-6">
            <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-purple-100 animate-pulse">
              <Lock className="h-8 w-8" />
            </div>
            
            <div>
              <span className="bg-purple-100 text-purple-700 font-bold text-xs uppercase px-3.5 py-1.5 rounded-full">
                Em Breve
              </span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-4 mb-2">AdSense & Impulsionamento</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Estamos estudando a melhor forma de implementar a compra e venda de cotizações de destaque e anúncios no UniVerso+. 
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 w-full text-left border border-slate-100">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">O que está planejado:</h4>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                  <span>Promoção de postagens em tempo real</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                  <span>Anúncios locais de atléticas e repúblicas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                  <span>Integração de cotas comerciais na rede</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-100 text-sm"
            >
              Voltar para o Feed
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Impulsionar;
