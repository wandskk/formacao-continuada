import Link from "next/link";
import { 
  Award, 
  QrCode, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  ArrowRight,
  School
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Institucional */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg block leading-tight">Formação Continuada</span>
              <span className="text-xs text-slate-500 block">Selo Nacional Compromisso com a Alfabetização</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/validar"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Validar Certificado
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm"
            >
              Acessar Sistema
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-transparent pt-12 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conformidade com Edital nº 7/2026 - MEC (Itens 22 e 35)
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Gestão Eficiente de Formações, <br className="hidden sm:inline" />
              <span className="text-brand-600">Presença Dinâmica & Certificação</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Plataforma para monitoramento de frequência em tempo real via QR Code rotativo, 
              geração de relatórios para o MEC e emissão de certificados digitais autenticáveis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition shadow-md shadow-brand-500/20"
              >
                Entrar com CPF
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/validar"
                className="inline-flex items-center gap-2 bg-white text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                <QrCode className="w-4 h-4 text-slate-500" />
                Autenticar Certificado
              </Link>
            </div>
          </div>
        </section>

        {/* Pilares do Sistema */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
              <div className="w-12 h-12 bg-blue-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Cursos & Turmas</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cadastro de formações, ementas completas, carga horária e links públicos exclusivos para auto-inscrição rápida.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Chamada Dinâmica</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                QR Code rotativo anti-fraude na tela do instrutor com check-in ágil pelo celular e contingência manual.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Relatórios MEC</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Item 22: Relatórios oficiais em PDF com CPF mascarado, percentual de frequência e concluintes homologados.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Certificação Digital</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Item 35: Emissão automática de certificados em PDF com ementa no verso, hash criptográfico e validação pública.
              </p>
            </div>
          </div>
        </section>

        {/* Perfis de Acesso */}
        <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Perfis de Acesso Simplificados</h2>
              <p className="text-slate-600 mt-2">Ambiente dedicado para cada participante da rede de ensino</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Secretaria de Educação</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Administrador</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Importa professores em lote, gerencia formações, audita presenças e homologa turmas para o MEC.
                </p>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">Gestão Central</span>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Formadores da Rede</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Instrutor</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Abre sessões do dia, projeta o QR Code dinâmico e registra presenças manuais de contingência.
                </p>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">Sala de Formação</span>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">Professores / Alunos</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Cursista</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Faz auto-inscrição em cursos, escaneia QR Code de presença, acompanha frequência e emite certificados.
                </p>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">Mobile Friendly</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <p className="max-w-2xl mx-auto">
          Sistema de Gestão de Formações e Certificação Digital. 
          Desenvolvido com foco no Selo Nacional Compromisso com a Alfabetização (MEC).
        </p>
      </footer>
    </div>
  );
}
