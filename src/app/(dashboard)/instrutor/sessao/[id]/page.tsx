import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect, notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, 
  Tv, 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Power, 
  QrCode,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { SessionAttendanceList } from "@/components/attendance/session-attendance-list";
import { toggleSessionStatusAction } from "@/actions/sessions";

interface SessionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InstrutorSessaoDetailPage({ params }: SessionDetailPageProps) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INSTRUTOR" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          enrollments: {
            include: { user: true },
            orderBy: { enrolledAt: "asc" },
          },
        },
      },
      attendances: {
        include: { user: true },
        orderBy: { checkInAt: "desc" },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const qrCount = session.attendances.filter((a) => a.method === "QR_CODE").length;
  const manualCount = session.attendances.filter((a) => a.method === "MANUAL").length;
  const totalEnrolled = session.course.enrollments.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Barra Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={user.role === "ADMIN" ? `/admin/cursos/${session.course.id}` : "/instrutor"}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {session.course.title}
                </span>
                {session.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Chamada Ativa
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Chamada Encerrada
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                {session.title || "Encontro de Formação"}
              </h1>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/projetor/${session.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Tv className="w-4 h-4 text-brand-400" />
              <span>Abrir Projetor de Sala (Tela Cheia)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <form
              action={async () => {
                "use server";
                await toggleSessionStatusAction(session.id);
              }}
            >
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition shadow-xs ${
                  session.isActive
                    ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                    : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{session.isActive ? "Encerrar Chamada" : "Reativar Chamada"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Métricas do Encontro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequência da Sessão</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {session.attendances.length} / {totalEnrolled}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {totalEnrolled > 0
                  ? `${Math.round((session.attendances.length / totalEnrolled) * 100)}% de presença`
                  : "Nenhum cursista matriculado"}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horas Deste Encontro</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{session.hours}h</span>
              <p className="text-xs text-slate-500 mt-1">Carga horária creditada</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Via QR Code Dinâmico</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{qrCount}</span>
              <p className="text-xs text-slate-500 mt-1">Check-ins autônomos em sala</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Baixas Manuais</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{manualCount}</span>
              <p className="text-xs text-slate-500 mt-1">Contingências registradas</p>
            </div>
          </div>
        </div>

        {/* Gestão e Lista de Presenças */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registro Nominal de Frequência</h2>
            <p className="text-xs text-slate-500">
              Acompanhe os check-ins em tempo real ou realize a baixa manual para cursistas sem celular.
            </p>
          </div>

          <SessionAttendanceList
            sessionId={session.id}
            attendances={session.attendances}
            enrollments={session.course.enrollments}
          />
        </div>
      </main>
    </div>
  );
}
