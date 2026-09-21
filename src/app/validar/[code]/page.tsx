import { getCertificateDetailsByCode } from "@/lib/certificate";
import { 
  ShieldCheck, 
  XCircle, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  ArrowLeft,
  Search,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface ValidarCodigoPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ValidarCodigoPage({ params }: ValidarCodigoPageProps) {
  const { code } = await params;
  const certificate = await getCertificateDetailsByCode(code.trim().toUpperCase());

  const formatDate = (d?: Date | null) => {
    if (!d) return "--/--/----";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(d));
  };

  const formatDateTime = (d: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header Institucional */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/validar" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">
                Secretaria Municipal de Educação
              </h1>
              <p className="text-xs text-slate-400">
                Portal de Validação Pública • Selo Alfabetização MEC
              </p>
            </div>
          </Link>

          <Link
            href="/validar"
            className="text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Nova Consulta</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-3xl mx-auto px-4 py-10 w-full my-auto">
        {!certificate ? (
          /* ================================================================= */
          /* CASO 1: CERTIFICADO NÃO LOCALIZADO / INVÁLIDO                     */
          /* ================================================================= */
          <div className="bg-slate-950/90 border border-rose-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Registro Inexistente ou Não Homologado
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Certificado Não Localizado
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                O código <strong className="font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800">{code}</strong> não corresponde a nenhum certificado homologado nos registros oficiais da Secretaria Municipal de Educação.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
              <strong className="text-slate-200 block">Possíveis motivos:</strong>
              <ul className="list-disc list-inside space-y-1">
                <li>O código foi digitado incorretamente. Verifique letras e números no documento impresso.</li>
                <li>A formação continuada ainda está em andamento ou em fase de apuração de frequência.</li>
                <li>O cursista não atingiu o índice mínimo de frequência (75%) exigido pelo Edital nº 7/2026.</li>
                <li>O documento apresentado é falso ou não foi emitido por este sistema municipal.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/validar"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Digitar outro código de autenticidade</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* CASO 2: CERTIFICADO AUTÊNTICO E HOMOLOGADO                        */
          /* ================================================================= */
          <div className="bg-slate-950/90 border border-emerald-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* BADGE DE AUTENTICIDADE */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1 justify-center sm:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Autenticidade Confirmada
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Certificado Válido e Homologado
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Código Oficial</span>
                <span className="text-sm font-mono font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {certificate.code}
                </span>
              </div>
            </div>

            {/* DADOS DO CURSISTA & FORMAÇÃO */}
            <div className="space-y-6">
              {/* Titular */}
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Professor(a) Titular do Certificado
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {certificate.cursista.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                  <span>CPF: <strong className="font-mono">{certificate.cursista.cpfMasked}</strong> (Protegido por LGPD)</span>
                  {certificate.cursista.school && (
                    <span>Lotação: <strong>{certificate.cursista.school}</strong></span>
                  )}
                </div>
              </div>

              {/* Formação Continuada */}
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ação de Formação Continuada
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-brand-300">
                  {certificate.course.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {certificate.course.description}
                </p>
              </div>

              {/* Grid de Metadados Oficiais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Carga Horária</span>
                  <span className="font-bold text-white text-sm">{certificate.course.totalHours} horas</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Frequência Apurada</span>
                  <span className="font-bold text-emerald-400 text-sm">{certificate.metrics.frequencyPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data de Emissão</span>
                  <span className="font-bold text-white text-sm">{formatDate(certificate.issuedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Homologação</span>
                  <span className="font-bold text-purple-400 text-sm">
                    {formatDate(certificate.homologation.homologatedAt || certificate.issuedAt)}
                  </span>
                </div>
              </div>

              {/* Enquadramento do Edital */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                  Enquadramento Legal e Atribuição Institucional:
                </span>
                <p>
                  Esta certificação foi emitida em estrito cumprimento aos <strong>Itens 22 e 35 do Edital nº 7/2026 do MEC</strong> (Selo Nacional Compromisso com a Alfabetização) e atende aos critérios de comprovação pedagógica e prestação de contas no SIMEC.
                </p>
              </div>

              {/* Assinatura Criptográfica Auditável */}
              <div className="space-y-1 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Assinatura Digital (Hash SHA-256):</span>
                  <span className="text-emerald-400 text-[9px] uppercase font-bold">Inviolável</span>
                </div>
                <p className="break-all text-slate-400">{certificate.verificationHash}</p>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/validar"
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Consultar outro código</span>
              </Link>

              <Link
                href={`/certificados/${encodeURIComponent(certificate.code)}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-brand-500/20 text-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Visualizar / Imprimir Certificado Completo</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>Sistema Municipal de Gestão de Formações e Certificação Continuada</p>
        <p className="text-[11px] mt-1">Conformidade estrita com a LGPD (Lei nº 13.709/2018) • Ministério da Educação</p>
      </footer>
    </div>
  );
}
