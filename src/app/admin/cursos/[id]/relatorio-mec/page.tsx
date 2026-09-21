import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect, notFound } from "next/navigation";
import { calculateCourseFrequencyData } from "@/lib/frequency";
import { maskCPF } from "@/lib/utils";
import { PrintReportButton } from "@/components/frequency/print-report-button";
import { School, Award, CheckCircle2, ShieldCheck } from "lucide-react";
import crypto from "crypto";

interface RelatorioMecPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelatorioMecPage({ params }: RelatorioMecPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const report = await calculateCourseFrequencyData(id);

  if (!report) {
    notFound();
  }

  const { course, cursistas, metrics, totalTaughtHours } = report;

  const issueDate = new Date();
  const reportHash = crypto
    .createHash("sha256")
    .update(`${course.id}-${issueDate.toISOString()}-${cursistas.length}`)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white py-6 sm:py-10 print:py-0 text-slate-900">
      <PrintReportButton courseId={course.id} />

      {/* Folha A4 Oficial */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 print:p-0 shadow-lg print:shadow-none border border-slate-200 print:border-none space-y-6">
        {/* Cabeçalho Institucional Oficial */}
        <header className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <School className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-tight">
                Secretaria Municipal de Educação
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Programa Municipal de Formação Continuada de Professores
              </p>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-300">
              Selo Nacional Compromisso com a Alfabetização • MEC (Edital nº 7/2026)
            </span>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-2">
              Relatório Oficial de Frequência e Cumprimento de Carga Horária
            </h1>
            <p className="text-xs text-slate-500">
              Comprovação formal de frequência nos termos do Item 22 do Edital de Adesão ao Selo MEC
            </p>
          </div>
        </header>

        {/* Dados da Ação Formativa */}
        <section className="bg-slate-50 print:bg-slate-50/50 p-4 rounded-xl border border-slate-300 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Ação Formativa</span>
            <span className="font-extrabold text-slate-900 text-sm leading-tight block">{course.title}</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Carga Horária Total</span>
            <span className="font-bold text-slate-900">{course.totalHours} horas</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Freq. Mínima Exigida</span>
            <span className="font-bold text-slate-900">{course.minFrequency}% de presença</span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Público-Alvo</span>
            <span className="font-medium text-slate-700">{course.targetAudience || "Professores da Rede Municipal"}</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Total de Encontros</span>
            <span className="font-bold text-slate-900">{report.sessions.length} sessões presenciais</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Data de Emissão</span>
            <span className="font-bold text-slate-900">{issueDate.toLocaleDateString("pt-BR")}</span>
          </div>
        </section>

        {/* Indicadores Consolidados da Turma */}
        <section className="grid grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Inscritos</span>
            <span className="font-black text-slate-900 text-base">{metrics.totalEnrolled}</span>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Aptos (≥{course.minFrequency}%)</span>
            <span className="font-black text-slate-900 text-base">{metrics.approvedCount}</span>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Abaixo do Corte</span>
            <span className="font-black text-slate-900 text-base">{metrics.reprovedCount}</span>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Taxa de Conclusão</span>
            <span className="font-black text-slate-900 text-base">{metrics.approvalRate}%</span>
          </div>
        </section>

        {/* Tabela Nominal Oficial de Frequência */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Relação Nominal de Professores Cursistas e Parecer de Frequência
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-extrabold border-b border-slate-300 uppercase text-[10px]">
                  <th className="py-2 px-2.5 text-center w-8">Nº</th>
                  <th className="py-2 px-3">Nome do Professor Cursista</th>
                  <th className="py-2 px-3">CPF (LGPD)</th>
                  <th className="py-2 px-3">Escola de Lotação</th>
                  <th className="py-2 px-2.5 text-center">Horas</th>
                  <th className="py-2 px-2.5 text-center">Freq (%)</th>
                  <th className="py-2 px-3 text-center">Parecer Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cursistas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Nenhum cursista matriculado nesta formação.
                    </td>
                  </tr>
                ) : (
                  cursistas.map((c, idx) => (
                    <tr key={c.enrollmentId} className={idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                      <td className="py-2 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{maskCPF(c.cpf)}</td>
                      <td className="py-2 px-3 text-slate-700">{c.school || "Rede Municipal"}</td>
                      <td className="py-2 px-2.5 text-center font-bold text-slate-900">
                        {c.completedHours}h
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-slate-900">
                        {c.frequencyPercentage}%
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {c.isApproved ? (
                          <span className="font-extrabold text-emerald-800 text-[10px] uppercase">
                            APTO
                          </span>
                        ) : (
                          <span className="font-extrabold text-amber-800 text-[10px] uppercase">
                            FREQUÊNCIA INSUFICIENTE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Termo de Homologação e Assinaturas */}
        <section className="pt-6 space-y-8 border-t border-slate-300">
          <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
            Declaramos para os devidos fins de direito e comprovação junto ao Ministério da Educação (MEC) que a
            relação nominal acima reflete fielmente as presenças apuradas eletronicamente durante os encontros
            formativos, com controle de chamada biométrico/digital via QR Code e contingência auditada, estando os
            professores classificados como "APTO" aptos para o recebimento do respectivo certificado digital autenticável
            (Item 35 do Edital nº 7/2026).
          </p>

          <div className="grid grid-cols-2 gap-12 pt-10 text-center text-xs">
            <div className="space-y-1">
              <div className="border-t border-slate-900 pt-2 w-3/4 mx-auto" />
              <p className="font-bold text-slate-900">Formador Responsável</p>
              <p className="text-[10px] text-slate-500">Coordenação Pedagógica da Formação</p>
            </div>

            <div className="space-y-1">
              <div className="border-t border-slate-900 pt-2 w-3/4 mx-auto" />
              <p className="font-bold text-slate-900">Secretaria Municipal de Educação</p>
              <p className="text-[10px] text-slate-500">Gestão de Formação Continuada / Selo MEC</p>
            </div>
          </div>

          {/* Autenticação do Relatório */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>HASH DE AUDITORIA: {reportHash}</span>
            <span>EMISSÃO: {issueDate.toLocaleString("pt-BR")}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
