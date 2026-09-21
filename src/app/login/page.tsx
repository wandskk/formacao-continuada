"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "@/actions/auth";
import { 
  School, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  Info
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(loginAction, null);
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  // Redireciona quando o login for bem-sucedido
  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  // Aplica máscara automática de CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    setCpf(value);
  };

  const handleFillDemo = (demoCpf: string, demoPass: string) => {
    setCpf(demoCpf);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Voltar para Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para a página inicial
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header do Formulário */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20 mb-3">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Acesso ao Sistema
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Formação Continuada • Selo Alfabetização MEC
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="mt-6 bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <form action={formAction} className="space-y-5">
            {/* Mensagem de Erro */}
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Campo CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-semibold text-slate-700 mb-1.5">
                CPF
              </label>
              <div className="relative">
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  required
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Aviso Primeiro Acesso para Professores */}
            <div className="bg-brand-50/70 border border-brand-100 rounded-xl p-3 text-xs text-brand-800 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-brand-600 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Primeiro acesso como professor(a)?</span>
                Sua senha inicial é sua Data de Nascimento no formato <strong>DDMMAAAA</strong> (ex: 12051988).
              </div>
            </div>

            {/* Botão de Envio */}
            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Dica para Demonstração / Testes Rápidos */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoHelp(!showDemoHelp)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                Contas de demonstração para teste
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoHelp ? "rotate-180" : ""}`} />
            </button>

            {showDemoHelp && (
              <div className="mt-3 space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleFillDemo("000.000.000-01", "admin123")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition"
                >
                  <span className="font-bold text-slate-800 block">ADMIN (Secretaria)</span>
                  <span className="text-slate-500">CPF: 000.000.000-01 | Senha: admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo("000.000.000-02", "instrutor123")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition"
                >
                  <span className="font-bold text-emerald-800 block">INSTRUTOR (Formador)</span>
                  <span className="text-slate-500">CPF: 000.000.000-02 | Senha: instrutor123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo("000.000.000-03", "12051988")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition"
                >
                  <span className="font-bold text-purple-800 block">CURSISTA (Professora)</span>
                  <span className="text-slate-500">CPF: 000.000.000-03 | Senha: 12051988 (Nasc.)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
