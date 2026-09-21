import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect, notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Calendar, 
  Edit, 
  FileText, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CopyCourseLinkButton } from "@/components/courses/copy-link-button";
import { ImportSpreadsheetModal } from "@/components/courses/import-modal";
import { EnrollmentTable } from "@/components/courses/enrollment-table";
import { CourseStatus } from "@prisma/client";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseDetailPage({ params }: CourseDetailPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          user: true,
          certificate: true,
        },
        orderBy: { enrolledAt: "desc" },
      },
      sessions: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const statusLabels: Record<CourseStatus, { label: string; bg: string }> = {
    OPEN: { label: "Inscrições Abertas", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    IN_PROGRESS: { label: "Em Andamento", bg: "bg-blue-50 text-brand-700 border-brand-200" },
    DRAFT: { label: "Rascunho", bg: "bg-slate-100 text-slate-700 border-slate-200" },
    COMPLETED: { label: "Concluído", bg: "bg-purple-50 text-purple-700 border-purple-200" },
    ARCHIVED: { label: "Arquivado", bg: "bg-slate-50 text-slate-500 border-slate-200" },
  };

  const badge = statusLabels[course.status];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Barra Superior de Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/cursos"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
              title="Voltar para a lista de formações"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">/inscricao/{course.slug}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{course.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CopyCourseLinkButton slug={course.slug} />

            <Link
              href={`/admin/cursos/${course.id}/editar`}
              className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Editar Informações</span>
            </Link>

            <ImportSpreadsheetModal
              courseId={course.id}
              courseTitle={course.title}
            />
          </div>
        </div>

        {/* Cards de Métricas da Formação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cursistas Matriculados</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{course.enrollments.length}</span>
              <p className="text-xs text-slate-500 mt-1">Professores na turma</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carga Horária Total</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{course.totalHours}h</span>
              <p className="text-xs text-slate-500 mt-1">Horas de formação</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presença Mínima</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{course.minFrequency}%</span>
              <p className="text-xs text-slate-500 mt-1">Critério de certificação MEC</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encontros Realizados</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{course.sessions.length}</span>
              <p className="text-xs text-slate-500 mt-1">Sessões de chamada registradas</p>
            </div>
          </div>
        </div>

        {/* Bloco de Ementa Oficial Cadastrada (Item 35 MEC) */}
        {course.syllabus && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Ementa e Conteúdo Programático Cadastrado (Item 35 MEC)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Verso do Certificado</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
              {course.syllabus}
            </div>
          </div>
        )}

        {/* Gestão de Cursistas Matriculados */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Professores Cursistas Matriculados</h2>
              <p className="text-xs text-slate-500">
                Lista nominal com escola, função e rastreabilidade para os relatórios do MEC
              </p>
            </div>

            <ImportSpreadsheetModal
              courseId={course.id}
              courseTitle={course.title}
              triggerButton={
                <button className="inline-flex items-center gap-2 bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-sm">
                  <Users className="w-4 h-4" />
                  <span>+ Importar Planilha de Cursistas</span>
                </button>
              }
            />
          </div>

          <EnrollmentTable
            courseId={course.id}
            enrollments={course.enrollments}
          />
        </div>
      </main>
    </div>
  );
}
