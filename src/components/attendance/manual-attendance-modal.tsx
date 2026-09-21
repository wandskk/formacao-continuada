"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { manualCheckInAction } from "@/actions/sessions";
import { 
  CheckSquare, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  User,
  ShieldAlert
} from "lucide-react";

interface ManualAttendanceModalProps {
  sessionId: string;
  userId: string;
  userName: string;
  userSchool?: string | null;
  triggerButton?: React.ReactNode;
}

export function ManualAttendanceModal({
  sessionId,
  userId,
  userName,
  userSchool,
  triggerButton,
}: ManualAttendanceModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [justification, setJustification] = useState("Sem smartphone no momento da formação");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const predefinedJustifications = [
    "Sem smartphone no momento da formação",
    "Bateria do celular descarregada",
    "Problemas de conexão ou sinal de internet móvel",
    "Falha técnica ou incompatibilidade na câmera do aparelho",
  ];

  const handleConfirm = () => {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await manualCheckInAction({
        sessionId,
        userId,
        justification,
      });

      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Erro ao registrar baixa manual.");
      }
    });
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-brand-700 hover:bg-blue-100 border border-brand-200 text-xs font-bold px-3 py-1.5 rounded-lg transition"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Baixa Manual</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Baixa Manual de Presença</h3>
                  <p className="text-xs text-slate-500">Registro de contingência com auditoria (MEC)</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-5">
              {/* Informações do Cursista */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                  {userName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{userName}</h4>
                  <p className="text-xs text-slate-500">{userSchool || "Rede Municipal de Ensino"}</p>
                </div>
              </div>

              {/* Justificativa Obrigatória */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Motivo da Contingência *
                </label>

                <div className="space-y-2">
                  {predefinedJustifications.map((item, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        justification === item
                          ? "border-brand-500 bg-blue-50/50 text-brand-900 font-semibold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="justificationRadio"
                        checked={justification === item}
                        onChange={() => setJustification(item)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">Ou especifique outro motivo:</span>
                  <input
                    type="text"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Descreva o motivo..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Esta ação será registrada nos relatórios de auditoria com seu identificador de formador e
                  a justificativa informada.
                </span>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirm}
                disabled={isPending || !justification.trim()}
                className="inline-flex items-center gap-2 bg-brand-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conceder Presença Manual</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
