import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Award, 
  PlusCircle, 
  Upload, 
  CheckCircle2,
  Clock
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  // Estatísticas gerais
  const totalCourses = await prisma.course.count();
  const totalUsers = await prisma.user.count();
  const totalEnrollments = await prisma.enrollment.count();
  const recentCourses = await prisma.course.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Boas-vindas e Ações Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel de Gestão da Secretaria</h1>
            <p className="text-sm text-slate-600 mt-1">
              Controle de formações, importação de professores e monitoramento para o Selo Alfabetização MEC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Nova Formação
            </button>
            <button className="inline-flex items-center gap-2 bg-white text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition shadow-sm">
              <Upload className="w-4 h-4 text-slate-500" />
              Importar Planilha
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formações Ativas</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalCourses}</span>
              <p className="text-xs text-slate-500 mt-1">Cursos cadastrados no sistema</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professores & Usuários</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalUsers}</span>
              <p className="text-xs text-slate-500 mt-1">Contas registradas na rede</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscrições em Turmas</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalEnrollments}</span>
              <p className="text-xs text-slate-500 mt-1">Matrículas ativas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relatórios Oficiais</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">Item 22 e 35</span>
              <p className="text-xs text-slate-500 mt-2">Prontos para homologação</p>
            </div>
          </div>
        </div>

        {/* Lista de Cursos Cadastrados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Formações Continuadas Recentes</h2>
              <p className="text-xs text-slate-500">Cursos disponíveis para inscrição e controle de chamada</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCourses.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Nenhum curso cadastrado ainda. Clique em "Nova Formação" para começar.
              </div>
            ) : (
              recentCourses.map((course) => (
                <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {course.totalHours}h totais
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-brand-700 px-2.5 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {course._count.enrollments} cursistas
                      </span>
                      <span className="font-medium text-slate-500">
                        Frequência mínima: {course.minFrequency}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {course.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
