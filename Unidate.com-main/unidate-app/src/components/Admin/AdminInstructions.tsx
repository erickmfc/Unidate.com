import React from 'react';
import { Shield } from 'lucide-react';

const AdminInstructions: React.FC = () => (
  <main className="mx-auto max-w-2xl p-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-5 flex items-center gap-3 text-violet-700">
        <Shield className="h-8 w-8" />
        <h1 className="text-2xl font-bold text-slate-900">Acesso administrativo</h1>
      </div>
      <p className="text-slate-600">
        O painel é restrito a contas autorizadas no Supabase. Entre pela página de administração
        usando a conta da equipe. As credenciais não são exibidas no site.
      </p>
      <a href="/admin/login" className="mt-6 inline-flex rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700">
        Ir para o login administrativo
      </a>
    </section>
  </main>
);

export default AdminInstructions;
