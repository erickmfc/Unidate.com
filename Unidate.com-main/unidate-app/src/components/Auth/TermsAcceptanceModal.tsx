import React, { useState } from 'react';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { acceptTerms, TERMS_VERSION } from '../../services/termsAcceptanceService';

interface TermsAcceptanceModalProps {
  userId: string;
  onAccepted: () => void;
}

const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({ userId, onAccepted }) => {
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAccept = async () => {
    if (!accepted || saving) return;

    setSaving(true);
    setErrorMessage('');
    try {
      await acceptTerms(userId);
      onAccepted();
    } catch (error) {
      console.error('Erro ao salvar aceite dos termos:', error);
      setErrorMessage('Não foi possível salvar seu aceite agora. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      data-testid="terms-acceptance-modal"
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <header className="border-b border-slate-200 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-6 text-white sm:px-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-100">UniDate</p>
              <h1 id="terms-title" className="mt-1 text-2xl font-bold sm:text-3xl">Termos de Aceitação e Uso</h1>
              <p className="mt-2 text-sm text-violet-100">Leia com atenção antes de continuar usando a plataforma.</p>
            </div>
          </div>
        </header>

        <div className="overflow-y-auto px-6 py-6 text-sm leading-6 text-slate-700 sm:px-10">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-violet-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
            <p>Este aceite é vinculado à sua conta e fica registrado com a versão <strong>{TERMS_VERSION}</strong> e a data da confirmação.</p>
          </div>

          <div className="space-y-5">
            <section><h2 className="text-base font-bold text-slate-900">1. Finalidade da plataforma</h2><p>O UniDate conecta pessoas da comunidade acadêmica para compartilhar publicações, participar de grupos e eventos, seguir perfis e conversar.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">2. Sua conta</h2><p>Você deve informar dados verdadeiros, manter sua senha protegida e usar somente sua própria conta. Avise o UniDate se notar acesso indevido.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">3. Uso responsável</h2><p>Não use a plataforma para assediar, ameaçar, discriminar, aplicar golpes, se passar por outra pessoa, enviar spam, publicar conteúdo ilegal ou compartilhar material íntimo sem consentimento. Respeite as pessoas nas publicações, grupos e mensagens.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">4. Dados e privacidade</h2><p>Tratamos os dados necessários para autenticação, perfil, publicações, mensagens, atividades e segurança do serviço. O registro deste aceite fica associado ao seu identificador de usuário, à versão do termo e ao horário da confirmação. Consulte as configurações e a política de privacidade para conhecer as opções disponíveis para seus dados.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">5. Conteúdo e mensagens</h2><p>Você continua responsável pelo conteúdo que publica e envia. Ao publicar, permite ao UniDate armazená-lo e exibi-lo dentro da plataforma para prestar o serviço. Denuncie conteúdo ou comportamento que viole estes termos.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">6. Moderação</h2><p>Podemos remover conteúdo e limitar, suspender ou encerrar contas que violem estes termos, a lei ou a segurança da comunidade. Quando possível, informaremos o motivo e o canal de contato disponível.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">7. Disponibilidade</h2><p>Trabalhamos para manter o serviço disponível e seguro, mas podem ocorrer manutenções, falhas ou mudanças. Recursos de terceiros podem ter suas próprias regras.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">8. Alterações</h2><p>Podemos atualizar estes termos para refletir mudanças no serviço ou na legislação. Quando uma nova versão exigir aceite, ela será apresentada novamente antes da continuidade do uso.</p></section>
            <section><h2 className="text-base font-bold text-slate-900">9. Sua confirmação</h2><p>Ao marcar a caixa abaixo, você confirma que leu, entendeu e concorda com estes termos de uso.</p></section>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-10">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500" data-testid="terms-checkbox" />
            <span>Li e aceito os Termos de Aceitação e Uso do UniDate.</span>
          </label>
          {errorMessage && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{errorMessage}</p>}
          <button type="button" onClick={handleAccept} disabled={!accepted || saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-semibold text-white transition hover:from-violet-700 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-50" data-testid="terms-accept-button">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            {saving ? 'Salvando aceite...' : 'Aceitar e continuar'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TermsAcceptanceModal;
