import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QrScanner } from "@/components/attendance/qr-scanner";
import Link from "next/link";
import { ArrowLeft, Camera, ShieldCheck } from "lucide-react";

export default async function CursistaCheckinPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/cursista"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-xs"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Registrar Presença</h1>
            <p className="text-xs text-slate-500">Aponte sua câmera para o QR Code projetado na sala</p>
          </div>
        </div>

        <QrScanner />

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Sua presença será registrada com hash de autenticidade para fins de certificação MEC.
          </span>
        </div>
      </main>
    </div>
  );
}
