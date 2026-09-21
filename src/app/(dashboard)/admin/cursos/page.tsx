import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  BookOpen, 
  PlusCircle, 
  Users, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CourseStatus } from "@prisma/client";

interface CursosPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminCursosListPage({ searchParams }: CursosPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as CourseStatus | undefined;
  const query = resolvedParams.q || "";

  const courses = await prisma.course.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { targetAudience: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: true, sessions: true },
      },
    },
  });

  const statusBadges: Record<CourseStatus, { label: string; bg: string }> = {
    OPEN: { label: "Inscrições Abertas", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    IN_PROGRESS: { label: "Em Andamento", bg: "bg-blue-50 text-brand-700 border-brand-200" },
    DRAFT: { label: "Rascunho", bg: "bg-slate-100 text-slate-700 border-slate-200" },
    COMPLETED: { label: "Concluído", bg: "bg-purple-50 text-purple-700 border-purple-200" },
    ARCHIVED: { label: "Arquivado", bg: "bg-slate-50 text-slate-500 border-slate-200" },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho de Navegação e Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Formações Continuadas</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Gerenciamento de turmas, inscrições públicas e ementas para certificação MEC
              </p>
            </div>
          </div>

          <Link
            href="/admin/cursos/novo"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-brand-700 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Nova Formação</span>
          </Link>
        </div>

        {/* Filtros de Status */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <Link
            href="/admin/cursos"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              !statusFilter
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Todos os Cursos
          </Link>
          <Link
            href="/admin/cursos?status=OPEN"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              statusFilter === CourseStatus.OPEN
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Inscrições Abertas
          </Link>
          <Link
            href="/admin/cursos?status=IN_PROGRESS"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              statusFilter === CourseStatus.IN_PROGRESS
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Em Andamento
          </Link>
          <Link
            href="/admin/cursos?status=COMPLETED"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              statusFilter === CourseStatus.COMPLETED
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Concluídos
          </Link>
        </div>

        {/* Lista de Cursos */}
        <div className="grid grid-cols-1 gap-4">
          {courses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Nenhuma formação encontrada</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Não existem cursos com os critérios selecionados. Clique em "Cadastrar Nova Formação" para criar um novo curso.
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const badge = statusBadges[course.status] || {
                label: course.status,
                bg: "bg-slate-100 text-slate-700 border-slate-200",
              };

              return (
                <div
                  key={course.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-200 hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/inscricao/{course.slug}</span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      <Link href={`/admin/cursos/${course.id}`} className="hover:text-brand-600 transition">
                        {course.title}
                      </Link>
                    </h2>

                    {course.targetAudience && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        <span className="font-semibold text-slate-700">Público:</span> {course.targetAudience}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course.totalHours} horas totais
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-brand-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Users className="w-3.5 h-3.5" />
                        {course._count.enrollments} cursistas inscritos
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {course._count.sessions} sessões realizadas
                      </span>
                      <span className="text-slate-400">
                        Freq. mínima: <strong className="text-slate-700">{course.minFrequency}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Link
                      href={`/admin/cursos/${course.id}/editar`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Editar
                    </Link>

                    <Link
                      href={`/admin/cursos/${course.id}`}
                      className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 px-4 py-2 rounded-xl text-xs font-bold transition border border-brand-200"
                    >
                      <span>Gerenciar Turma</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
