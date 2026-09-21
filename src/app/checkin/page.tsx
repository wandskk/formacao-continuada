import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { DirectCheckinClient } from "@/components/attendance/direct-checkin-client";
import { School, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CheckinPageProps {
  searchParams: Promise<{
    s?: string;
    t?: string;
  }>;
}

export default async function DirectCheckinPage({ searchParams }: CheckinPageProps) {
  const { s: sessionId, t: qrToken } = await searchParams;

  if (!sessionId || !qrToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 text-lg">Parâmetros de Chamada Ausentes</h2>
          <p className="text-xs text-slate-500">
            O link acessado não contém as credenciais da sessão. Por favor, aponte a câmera novamente para o telão de projeção.
          </p>
          <Link
            href="/cursista"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline pt-2"
          >
            Voltar ao Painel do Cursista
          </Link>
        </div>
      </div>
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      course: { select: { title: true } },
    },
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 text-lg">Sessão Não Encontrada</h2>
          <p className="text-xs text-slate-500">
            Esta sessão de formação não existe ou foi encerrada pela coordenação.
          </p>
        </div>
      </div>
    );
  }

  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header Institucional */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-tight block">Formação Continuada</span>
              <span className="text-[11px] text-slate-500">Selo Alfabetização MEC</span>
            </div>
          </div>

          {currentUser && (
            <span className="text-xs font-semibold text-slate-600">
              {currentUser.name.split(" ")[0]}
            </span>
          )}
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <DirectCheckinClient
          sessionId={session.id}
          qrToken={qrToken}
          currentUser={currentUser}
          courseTitle={session.course.title}
          sessionTitle={session.title}
          hours={session.hours}
        />
      </main>

      {/* Rodapé */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        Registro oficial de presença em conformidade com o Edital nº 7/2026 MEC.
      </footer>
    </div>
  );
}
