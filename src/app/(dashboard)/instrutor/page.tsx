import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import { 
  QrCode, 
  CheckSquare, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  Sparkles
} from "lucide-react";

export default async function InstrutorDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INSTRUTOR" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner do Instrutor */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Ambiente do Formador
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Olá, {user.name}!
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
            Selecione uma turma abaixo para projetar o QR Code dinâmico anti-fraude na sala de formação
            ou realize a baixa manual para cursistas sem celular.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Abrir Chamada por QR Code</h3>
              <p className="text-xs text-slate-600 mt-1 mb-3">
                Gera um token dinâmico rotativo a cada 20 segundos na tela de projeção para leitura pelos cursistas.
              </p>
              <button className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition">
                Iniciar Sessão
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Baixa Manual de Presença</h3>
              <p className="text-xs text-slate-600 mt-1 mb-3">
                Contingência imediata para cursistas sem smartphone, bateria ou conectividade no momento da formação.
              </p>
              <button className="text-xs font-bold text-brand-700 bg-blue-50 hover:bg-blue-100 border border-brand-200 px-3 py-1.5 rounded-lg transition">
                Registrar Manualmente
              </button>
            </div>
          </div>
        </div>

        {/* Cursos Disponíveis para o Instrutor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-lg">Suas Turmas e Formações</h2>
            <p className="text-xs text-slate-500">Cursos disponíveis para abertura de chamadas</p>
          </div>

          <div className="divide-y divide-slate-100">
            {courses.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Nenhuma turma cadastrada no momento.
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.targetAudience || course.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {course.totalHours}h
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {course._count.enrollments} cursistas matriculados
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Calendar className="w-3 h-3" />
                        {course._count.sessions} encontros realizados
                      </span>
                    </div>
                  </div>

                  <button className="self-start sm:self-center inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition shadow-sm">
                    <QrCode className="w-3.5 h-3.5" />
                    Projetar Chamada
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
