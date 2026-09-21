import { ShieldCheck, Search, Award, CheckCircle2, FileCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ValidarCertificadoIndexPage() {
  async function searchCertificateAction(formData: FormData) {
    "use server";
    const rawCode = formData.get("code") as string;
    if (!rawCode || !rawCode.trim()) {
      return;
    }
    const cleanCode = rawCode.trim().toUpperCase();
    redirect(`/validar/${encodeURIComponent(cleanCode)}`);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header Institucional */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">
                Secretaria Municipal de Educação
              </h1>
              <p className="text-xs text-slate-400">
                Portal Público de Autenticidade de Certificados • MEC Edital nº 7/2026
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700"
          >
            Acessar Sistema
          </Link>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-3xl mx-auto px-4 py-12 w-full space-y-8 my-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Validação Pública Conforme Item 35 do Edital nº 7/2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Consultar Autenticidade de Certificado
          </h2>

          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Verifique a validade de certificados de formação continuada emitidos para professores da rede municipal de ensino. Digite o código impresso no documento oficial.
          </p>
        </div>

        {/* Card do Formulário de Busca */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form action={searchCertificateAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Código de Autenticidade
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder="Ex: CERT-2026-X8K9M2"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 font-mono text-base tracking-wider focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 uppercase"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                O código de autenticidade encontra-se impresso no canto inferior do certificado, logo abaixo do QR Code.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg shadow-brand-500/25 text-sm"
            >
              <span>Consultar e Validar Certificado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Destaques de Segurança */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Homologação Oficial</strong>
                <span className="text-slate-400 text-[11px]">Auditado e homologado pela Secretaria Municipal.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Integridade SHA-256</strong>
                <span className="text-slate-400 text-[11px]">Assinatura matemática inviolável contra adulterações.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Padrão MEC</strong>
                <span className="text-slate-400 text-[11px]">Em conformidade com o Selo Alfabetização 2026.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>Sistema Municipal de Gestão de Formações e Certificação Continuada</p>
        <p className="text-[11px] mt-1">Conformidade estrita com a LGPD (Lei nº 13.709/2018) • Ministério da Educação</p>
      </footer>
    </div>
  );
}
