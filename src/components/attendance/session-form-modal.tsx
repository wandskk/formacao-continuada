"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createSessionAction } from "@/actions/sessions";
import { 
  Calendar, 
  Clock, 
  PlusCircle, 
  X, 
  Check, 
  AlertCircle,
  FileText
} from "lucide-react";

interface SessionFormModalProps {
  courseId: string;
  courseTitle: string;
  triggerButton?: React.ReactNode;
}

export function SessionFormModal({
  courseId,
  courseTitle,
  triggerButton,
}: SessionFormModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const actionFn = async (prevState: any, formData: FormData) => {
    const res = await createSessionAction(courseId, prevState, formData);
    if (res.success && res.data) {
      setIsOpen(false);
      router.push(`/instrutor/sessao/${res.data.id}`);
      router.refresh();
    }
    return res;
  };

  const [state, formAction, isPending] = useActionState(actionFn, null);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Iniciar Novo Encontro / Sessão</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Abrir Sessão de Chamada</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{courseTitle}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form action={formAction} className="p-6 space-y-4">
              {state?.error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tema / Título do Encontro
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ex: Encontro 1: Consciência Fonológica e Alfabetização"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data do Encontro *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={todayStr}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Carga Horária (h) *
                  </label>
                  <input
                    type="number"
                    name="hours"
                    required
                    min={1}
                    defaultValue={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Ao criar o encontro, você será direcionado para o painel da sessão e poderá acionar a projeção do QR Code em tela cheia na sala de aula.
              </p>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isPending ? "Abrindo Sessão..." : "Criar Encontro & Projetar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
