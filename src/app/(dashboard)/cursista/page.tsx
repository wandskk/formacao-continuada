import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Camera, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default async function CursistaDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Busca matrículas do cursista com dados do curso e presenças
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          sessions: true,
        },
      },
      certificate: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Cartão de Boas-Vindas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full">
            Painel do Professor Cursista
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-3">
            Olá, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.school ? `${user.school}` : "Rede Municipal de Educação"} 
            {user.function ? ` • ${user.function}` : ""}
          </p>
        </div>

        {/* Botão de Ação Primária: Registrar Presença (Mobile First) */}
        <div className="bg-gradient-to-br from-brand-600 to-blue-700 text-white p-6 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Está em uma formação agora?</h2>
              <p className="text-xs text-brand-100">Escaneie o QR Code projetado pelo formador na sala.</p>
            </div>
          </div>

          <Link
            href="/cursista/checkin"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-brand-700 font-bold py-3.5 px-4 rounded-xl hover:bg-brand-50 transition shadow-sm text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Abrir Câmera para Check-in</span>
          </Link>
        </div>

        {/* Suas Inscrições / Cursos */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 text-lg">Minhas Formações</h2>

          {enrollments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Nenhuma inscrição encontrada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Você ainda não está matriculado em nenhuma formação. Utilize o link fornecido pelo formador ou secretaria para se inscrever.
              </p>
            </div>
          ) : (
            enrollments.map((enrollment) => {
              const { course, certificate } = enrollment;
              const totalSessions = course.sessions.length;

              return (
                <div key={enrollment.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-brand-700 border border-brand-200">
                      {enrollment.status === "IN_PROGRESS" ? "Em Andamento" : enrollment.status}
                    </span>
                  </div>

                  {/* Informações de Frequência e Carga Horária */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Carga Horária</span>
                      <span className="font-bold text-slate-800">{course.totalHours} horas</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Frequência Mínima</span>
                      <span className="font-bold text-slate-800">{course.minFrequency}%</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block">Certificado</span>
                      {certificate ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Disponível
                        </span>
                      ) : (
                        <span className="text-slate-500">Ao homologar</span>
                      )}
                    </div>
                  </div>

                  {/* Botão de Certificado se emitido */}
                  {certificate && (
                    <div className="pt-2">
                      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition">
                        <Award className="w-4 h-4" />
                        Baixar Certificado Autenticável
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
