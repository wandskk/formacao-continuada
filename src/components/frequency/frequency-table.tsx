"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maskCPF, formatCPF } from "@/lib/utils";
import { 
  homologateEnrollmentAction, 
  homologateBatchCourseAction, 
  revertHomologationAction 
} from "@/actions/frequency";
import {
  issueCertificateAction,
  issueBatchCertificatesAction
} from "@/actions/certificate";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck, 
  Clock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Award, 
  FileSpreadsheet, 
  Printer, 
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { CursistaFrequencyRecord } from "@/lib/frequency";

interface FrequencyTableProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  totalHours: number;
  minFrequency: number;
  cursistas: CursistaFrequencyRecord[];
  sessions: {
    id: string;
    title?: string | null;
    date: Date;
    hours: number;
  }[];
}

export function FrequencyTable({
  courseId,
  courseTitle,
  courseSlug,
  totalHours,
  minFrequency,
  cursistas,
  sessions,
}: FrequencyTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "homologated">("all");
  const [search, setSearch] = useState("");
  const [showFullCpf, setShowFullCpf] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);

  const eligibleCount = cursistas.filter((c) => c.isApproved && !c.isHomologated).length;
  const homologatedWithoutCertCount = cursistas.filter((c) => c.isHomologated && !c.hasCertificate).length;

  const filtered = cursistas.filter((c) => {
    if (filter === "approved" && !c.isApproved) return false;
    if (filter === "pending" && c.isApproved) return false;
    if (filter === "homologated" && !c.isHomologated) return false;

    if (!search) return true;
    const term = search.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(term);
    const cpfMatch = c.cpf.includes(term);
    const schoolMatch = (c.school || "").toLowerCase().includes(term);
    return nameMatch || cpfMatch || schoolMatch;
  });

  const handleHomologateSingle = (enrollmentId: string) => {
    setActionId(enrollmentId);
    startTransition(async () => {
      await homologateEnrollmentAction(enrollmentId);
      setActionId(null);
      router.refresh();
    });
  };

  const handleRevertSingle = (enrollmentId: string) => {
    if (!confirm("Tem certeza que deseja estornar a homologação deste cursista?")) return;
    setActionId(enrollmentId);
    startTransition(async () => {
      await revertHomologationAction(enrollmentId);
      setActionId(null);
      router.refresh();
    });
  };

  const handleBatchHomologate = () => {
    if (!confirm(`Deseja homologar todos os ${eligibleCount} cursistas que atingiram a frequência mínima de ${minFrequency}%?`)) {
      return;
    }

    startTransition(async () => {
      const res = await homologateBatchCourseAction(courseId);
      if (res.success && res.data) {
        setBatchSuccess(`${res.data.homologatedCount} cursistas homologados com sucesso!`);
        setTimeout(() => setBatchSuccess(null), 4000);
        router.refresh();
      }
    });
  };

  const handleIssueSingleCertificate = (enrollmentId: string) => {
    setActionId(`cert-${enrollmentId}`);
    startTransition(async () => {
      const res = await issueCertificateAction(enrollmentId);
      setActionId(null);
      if (res.success && res.data) {
        setBatchSuccess(`Certificado ${res.data.code} emitido com sucesso!`);
        setTimeout(() => setBatchSuccess(null), 4000);
        router.refresh();
      } else {
        alert(res.error || "Erro ao emitir certificado.");
      }
    });
  };

  const handleBatchIssueCertificates = () => {
    if (!confirm(`Deseja emitir os certificados oficiais para os ${homologatedWithoutCertCount} cursistas homologados?`)) {
      return;
    }

    startTransition(async () => {
      const res = await issueBatchCertificatesAction(courseId);
      if (res.success && res.data) {
        setBatchSuccess(`${res.data.issuedCount} certificados emitidos com sucesso!`);
        setTimeout(() => setBatchSuccess(null), 4000);
        router.refresh();
      } else {
        alert(res.error || "Erro ao emitir certificados em lote.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {batchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{batchSuccess}</span>
        </div>
      )}

      {/* Barra de Ações Superiores */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Abas de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({cursistas.length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filter === "approved" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aptos (≥{minFrequency}%)</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filter === "pending" ? "bg-amber-600 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Abaixo do Corte</span>
          </button>
          <button
            onClick={() => setFilter("homologated")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filter === "homologated" ? "bg-purple-600 text-white shadow-xs" : "text-purple-700 hover:bg-purple-50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Homologados</span>
          </button>
        </div>

        {/* Botões de Exportação, Homologação e Certificação */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/api/cursos/${courseId}/relatorio-mec/excel`}
            download
            className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs"
            title="Download da planilha oficial para o MEC"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel (MEC)</span>
          </a>

          <Link
            href={`/admin/cursos/${courseId}/relatorio-mec`}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs"
            title="Visualizar relatório oficial formatado em A4"
          >
            <Printer className="w-3.5 h-3.5 text-brand-600" />
            <span>Relatório A4 / PDF</span>
          </Link>

          {/* Botão de Homologação em Massa */}
          {eligibleCount > 0 && (
            <button
              onClick={handleBatchHomologate}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white hover:bg-brand-700 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Homologando...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Homologar Aptos ({eligibleCount})</span>
                </>
              )}
            </button>
          )}

          {/* Botão de Emissão de Certificados em Massa */}
          {homologatedWithoutCertCount > 0 && (
            <button
              onClick={handleBatchIssueCertificates}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
              title="Emitir certificados para cursistas homologados"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Emitindo Certificados...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Emitir Certificados ({homologatedWithoutCertCount})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa e Visualização de CPF */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF ou escola..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          onClick={() => setShowFullCpf((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition self-start sm:self-center"
        >
          {showFullCpf ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Mascarar CPF (LGPD)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Exibir CPF Completo</span>
            </>
          )}
        </button>
      </div>

      {/* Tabela de Frequência e Certificação */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum professor cursista corresponde aos filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Cursista</th>
                  <th className="py-3.5 px-4">Escola / Lotação</th>
                  <th className="py-3.5 px-4 text-center">Horas</th>
                  <th className="py-3.5 px-4">Frequência</th>
                  <th className="py-3.5 px-4">Parecer MEC</th>
                  <th className="py-3.5 px-4">Homologação</th>
                  <th className="py-3.5 px-4">Certificado</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.enrollmentId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        CPF: {showFullCpf ? formatCPF(c.cpf) : maskCPF(c.cpf)} {c.function ? `• ${c.function}` : ""}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="line-clamp-1">{c.school || "Não informada"}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-900 text-sm">{c.completedHours}h</span>
                      <span className="text-[11px] text-slate-400 block">de {totalHours}h</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs w-9">
                          {c.frequencyPercentage}%
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                          <div
                            className={`h-full rounded-full transition-all ${
                              c.isApproved ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, c.frequencyPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Apto para Certificação
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="w-3 h-3" />
                          Abaixo de {minFrequency}%
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.isHomologated ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[11px] border border-purple-200">
                          <ShieldCheck className="w-3 h-3" />
                          Homologado
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Pendente</span>
                      )}
                    </td>

                    {/* Coluna de Certificado */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.hasCertificate && c.certificateCode ? (
                        <Link
                          href={`/certificados/${encodeURIComponent(c.certificateCode)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition"
                          title="Visualizar Certificado Oficial"
                        >
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{c.certificateCode}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      ) : c.isHomologated ? (
                        <button
                          onClick={() => handleIssueSingleCertificate(c.enrollmentId)}
                          disabled={isPending && actionId === `cert-${c.enrollmentId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                          title="Emitir certificado oficial agora"
                        >
                          {isPending && actionId === `cert-${c.enrollmentId}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Award className="w-3 h-3" />
                          )}
                          <span>Emitir Certificado</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Ao homologar</span>
                      )}
                    </td>

                    {/* Coluna de Ações */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {c.isHomologated ? (
                        <button
                          onClick={() => handleRevertSingle(c.enrollmentId)}
                          disabled={isPending && actionId === c.enrollmentId}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                          title="Estornar homologação para revisão"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Estornar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHomologateSingle(c.enrollmentId)}
                          disabled={(isPending && actionId === c.enrollmentId) || !c.isApproved}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 px-3 py-1.5 rounded-lg shadow-xs transition"
                          title={c.isApproved ? "Homologar aprovação" : "Necessário atingir frequência mínima"}
                        >
                          {isPending && actionId === c.enrollmentId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>Homologar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
