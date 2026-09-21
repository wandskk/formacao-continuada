"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { publicEnrollAction, authenticatedEnrollAction } from "@/actions/courses";
import { formatCPF, sanitizeNumeric } from "@/lib/utils";
import { 
  CheckCircle2, 
  UserPlus, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Calendar, 
  School, 
  Phone, 
  Mail, 
  Briefcase,
  UserCheck
} from "lucide-react";
import Link from "next/link";

interface PublicEnrollmentFormProps {
  courseSlug: string;
  courseId: string;
  currentUser?: {
    id: string;
    name: string;
    cpf: string;
  } | null;
  isAlreadyEnrolled?: boolean;
}

export function PublicEnrollmentForm({
  courseSlug,
  courseId,
  currentUser,
  isAlreadyEnrolled = false,
}: PublicEnrollmentFormProps) {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeNumeric(e.target.value).slice(0, 11);
    setCpf(formatCPF(raw));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeNumeric(e.target.value).slice(0, 11);
    if (raw.length > 10) {
      setPhone(raw.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"));
    } else if (raw.length > 6) {
      setPhone(raw.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3"));
    } else if (raw.length > 2) {
      setPhone(raw.replace(/^(\d{2})(\d{0,5})$/, "($1) $2"));
    } else {
      setPhone(raw);
    }
  };

  // Se o cursista já está autenticado
  if (currentUser) {
    if (isAlreadyEnrolled) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Você já está matriculado nesta formação!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Sua vaga está garantida. Acesse seu painel de cursista para acompanhar os encontros e registrar suas presenças por QR Code.
            </p>
          </div>
          <Link
            href="/cursista"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-sm"
          >
            <span>Ir para Meu Painel de Cursista</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );
    }

    // Autenticado mas ainda não matriculado: inscrição em 1 clique
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Identificado no Sistema</span>
            <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">CPF: {formatCPF(currentUser.cpf)}</p>
          </div>
        </div>

        <form
          action={async () => {
            const res = await authenticatedEnrollAction(courseId);
            if (res.success) {
              router.push("/cursista");
              router.refresh();
            } else if (res.error) {
              alert(res.error);
            }
          }}
        >
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-brand-700 transition shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Minha Inscrição Nesta Formação</span>
          </button>
        </form>
      </div>
    );
  }

  // Cursista deslogado: Formulário completo de auto-inscrição
  const actionFn = async (prevState: any, formData: FormData) => {
    const res = await publicEnrollAction(courseSlug, prevState, formData);
    if (res.success) {
      router.push("/cursista");
      router.refresh();
    }
    return res;
  };

  const [state, formAction, isPending] = useActionState(actionFn, null);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <UserPlus className="w-3.5 h-3.5" />
          Inscrição Rápida de Professor Cursista
        </div>
        <h3 className="font-bold text-slate-900 text-xl">Preencha seus dados para garantir sua vaga</h3>
        <p className="text-xs text-slate-500 mt-1">
          Seu cadastro será gerado automaticamente e você terá acesso imediato à lista de presença da turma.
        </p>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Nome Completo */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Ex: Maria Aparecida Santos"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* CPF e Data de Nascimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpf" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CPF *
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data de Nascimento *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Sua data de nascimento será sua senha inicial de acesso (DDMMAAAA).
            </p>
          </div>
        </div>

        {/* Escola e Cargo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="school" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-400" />
              Escola / Unidade de Lotação
            </label>
            <input
              type="text"
              id="school"
              name="school"
              placeholder="Ex: E.M. Professora Ana Lúcia"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="function" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Cargo / Função
            </label>
            <input
              type="text"
              id="function"
              name="function"
              placeholder="Ex: Professor 1º Ano, Coordenador..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Contato (Telefone e Email) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              E-mail (Opcional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seuemail@escola.gov.br"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-brand-700 transition shadow-md disabled:opacity-50"
          >
            {isPending ? (
              <span>Processando inscrição...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Efetivar Minha Inscrição</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 pt-1">
          Já tem conta no sistema?{" "}
          <Link href="/login" className="text-brand-600 hover:underline font-semibold">
            Clique aqui para entrar com seu CPF
          </Link>
        </p>
      </form>
    </div>
  );
}
