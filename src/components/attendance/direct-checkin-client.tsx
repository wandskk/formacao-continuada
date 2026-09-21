"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInAction } from "@/actions/sessions";
import { loginAction } from "@/actions/auth";
import { formatCPF, sanitizeNumeric } from "@/lib/utils";
import { 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Clock, 
  School, 
  Loader2, 
  Lock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface DirectCheckinClientProps {
  sessionId: string;
  qrToken: string;
  currentUser?: {
    id: string;
    name: string;
    cpf: string;
  } | null;
  courseTitle: string;
  sessionTitle: string | null;
  hours: number;
}

export function DirectCheckinClient({
  sessionId,
  qrToken,
  currentUser,
  courseTitle,
  sessionTitle,
  hours,
}: DirectCheckinClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para login rápido caso deslogado
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizeNumeric(e.target.value).slice(0, 11);
    setCpf(formatCPF(clean));
  };

  // Se logado: confirmação imediata
  const handleConfirmLoggedIn = () => {
    startTransition(async () => {
      setErrorMessage(null);
      const res = await checkInAction({ sessionId, qrToken });
      if (res.success && res.data) {
        setSuccessData(res.data);
      } else {
        setErrorMessage(res.error || "Falha ao validar presença.");
      }
    });
  };

  // Se deslogado: login e registro em uma única operação
  const handleLoginAndCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("cpf", cpf);
      formData.append("password", password);

      const loginRes = await loginAction(null, formData);
      if (loginRes.error) {
        setErrorMessage(loginRes.error);
        return;
      }

      // Após login, executa check-in imediato
      const checkinRes = await checkInAction({ sessionId, qrToken });
      if (checkinRes.success && checkinRes.data) {
        setSuccessData(checkinRes.data);
      } else {
        setErrorMessage(checkinRes.error || "Login efetuado, mas não foi possível registrar a presença.");
      }
    });
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Tela de Sucesso */}
      {successData ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-5 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Presença Registrada com Sucesso!
            </span>
            <h2 className="text-xl font-bold text-slate-900 pt-2">{successData.courseTitle}</h2>
            <p className="text-xs text-slate-500">{successData.sessionTitle || "Encontro Presencial"}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-slate-400 block">Horas Computadas</span>
              <span className="font-extrabold text-slate-900 text-base">{successData.hours} horas</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-400 block">Horário Registrado</span>
              <span className="font-extrabold text-brand-600 text-base">
                {new Date(successData.checkInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/cursista"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-brand-700 transition shadow-md text-sm"
            >
              <Award className="w-4 h-4" />
              <span>Acessar Meu Painel de Cursista</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-blue-50 px-3 py-1 rounded-full border border-brand-200">
              <Clock className="w-3.5 h-3.5" />
              Check-in de Presença Oficial
            </div>
            <h1 className="text-xl font-bold text-slate-900">{courseTitle}</h1>
            <p className="text-xs text-slate-500">
              {sessionTitle || "Encontro Presencial"} • Carga de <strong>{hours}h</strong>
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Se Cursista Já Logado */}
          {currentUser ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cursista Identificado:</span>
                <p className="font-bold text-slate-900 text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-500">CPF: {formatCPF(currentUser.cpf)}</p>
              </div>

              <button
                onClick={handleConfirmLoggedIn}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-brand-700 transition shadow-md text-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validando Presença...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Minha Presença Agora</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Se Deslogado: Formulário Rápido */
            <form onSubmit={handleLoginAndCheckin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seu CPF *
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Senha de Acesso *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Data de Nascimento (DDMMAAAA)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-brand-700 transition shadow-md text-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entrando e Registrando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrar e Registrar Presença</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Validação oficial para o Selo Compromisso com a Alfabetização MEC</span>
          </div>
        </div>
      )}
    </div>
  );
}
