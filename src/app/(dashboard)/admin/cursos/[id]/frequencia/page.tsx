import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect, notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { calculateCourseFrequencyData } from "@/lib/frequency";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  ShieldCheck, 
  Printer, 
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { FrequencyTable } from "@/components/frequency/frequency-table";

interface FrequenciaPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCursoFrequenciaPage({ params }: FrequenciaPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const report = await calculateCourseFrequencyData(id);

  if (!report) {
    notFound();
  }

  const { course, sessions, cursistas, metrics, totalTaughtHours } = report;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Barra Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/cursos/${course.id}`}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
              title="Voltar ao curso"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Item 22 Edital MEC
                </span>
                <span className="text-xs text-slate-400 font-mono">Carga Total: {course.totalHours}h</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Apuração de Frequência: {course.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/admin/cursos/${course.id}/relatorio-mec`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Gerar Relatório Oficial MEC</span>
            </Link>
          </div>
        </div>

        {/* Cards de Métricas da Turma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cursistas Matriculados</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.totalEnrolled}</span>
              <p className="text-xs text-slate-500 mt-1">Professores na turma</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aptos para Certificação</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-emerald-600">{metrics.approvedCount}</span>
              <p className="text-xs text-slate-500 mt-1">
                Frequência ≥ {course.minFrequency}% ({metrics.approvalRate}% da turma)
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Homologados pela Secretaria</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-purple-700">{metrics.homologatedCount}</span>
              <p className="text-xs text-slate-500 mt-1">
                Prontos para emissão de certificado (DEC-005)
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horas Ministradas</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalTaughtHours}h</span>
              <p className="text-xs text-slate-500 mt-1">Em {sessions.length} encontros realizados</p>
            </div>
          </div>
        </div>

        {/* Tabela Interativa de Frequência */}
        <FrequencyTable
          courseId={course.id}
          courseTitle={course.title}
          courseSlug={course.slug}
          totalHours={course.totalHours}
          minFrequency={course.minFrequency}
          cursistas={cursistas}
          sessions={sessions}
        />
      </main>
    </div>
  );
}
