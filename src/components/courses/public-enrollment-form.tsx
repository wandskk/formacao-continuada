"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { publicEnrollAction, authenticatedEnrollAction } from "@/actions/courses";
import { formatCPF, sanitizeNumeric, formatDateInput } from "@/lib/utils";
import { 
  CheckCircle2, 
  UserPlus, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Calendar, 
  School as SchoolIcon, 
  Phone, 
  Mail, 
  Briefcase, 
  Layers, 
  UserCheck, 
  Check, 
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { 
  BARAUNA_MUNICIPAL_SCHOOLS, 
  DEFAULT_PRO_ALFA_ROLES, 
  parseOptionsList 
} from "@/lib/constants/schools";

interface PublicEnrollmentFormProps {
  courseSlug: string;
  courseId: string;
  currentUser?: {
    id: string;
    name: string;
    cpf: string;
    school?: string | null;
    function?: string | null;
    phone?: string | null;
  } | null;
  isAlreadyEnrolled?: boolean;
  courseConfig?: {
    organizer?: string | null;
    partner?: string | null;
    enrollmentNotice?: string | null;
    roleOptions?: string | null;
    schoolOptions?: string | null;
    trackOptions?: string | null;
    requirePhone?: boolean;
  };
}

export function PublicEnrollmentForm({
  courseSlug,
  courseId,
  currentUser,
  isAlreadyEnrolled = false,
  courseConfig,
}: PublicEnrollmentFormProps) {
  const router = useRouter();

  // Opções configuradas no curso ou padrões do sistema
  const roleList = parseOptionsList(courseConfig?.roleOptions).length > 0 
    ? parseOptionsList(courseConfig?.roleOptions) 
    : DEFAULT_PRO_ALFA_ROLES;

  const trackList = parseOptionsList(courseConfig?.trackOptions);

  const schoolList = parseOptionsList(courseConfig?.schoolOptions).length > 0 
    ? parseOptionsList(courseConfig?.schoolOptions) 
    : BARAUNA_MUNICIPAL_SCHOOLS;

  const isPhoneRequired = courseConfig?.requirePhone !== false;

  // Estados dos campos do formulário
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [selectedRole, setSelectedRole] = useState(roleList[0] || "Professor(a)");
  const [customRole, setCustomRole] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(schoolList[0] || "");
  const [customSchool, setCustomSchool] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(trackList[0] || "");
  const [birthDate, setBirthDate] = useState("");

  // Estado para cursista já autenticado
  const [authTrack, setAuthTrack] = useState(trackList[0] || "");
  const [authRole, setAuthRole] = useState(currentUser?.function || roleList[0] || "Professor(a)");
  const [authSchool, setAuthSchool] = useState(currentUser?.school || schoolList[0] || "");
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeNumeric(e.target.value).slice(0, 11);
    setCpf(formatCPF(raw));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(formatDateInput(e.target.value));
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

    // Autenticado mas ainda não matriculado: confirmação com personalização
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Identificado no Sistema</span>
            <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">CPF: {formatCPF(currentUser.cpf)}</p>
          </div>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsAuthPending(true);
            setAuthError(null);
            const res = await authenticatedEnrollAction(courseId, {
              school: authSchool,
              function: authRole,
              track: authTrack || undefined,
            });
            setIsAuthPending(false);
            if (res.success) {
              router.push("/cursista");
              router.refresh();
            } else if (res.error) {
              setAuthError(res.error);
            }
          }}
          className="space-y-4"
        >
          {/* Trilha formativa caso existam opções */}
          {trackList.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Trilha Formativa da qual participará *
              </label>
              <div className="space-y-2">
                {trackList.map((tr) => (
                  <label
                    key={tr}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                      authTrack === tr
                        ? "border-brand-500 bg-brand-50/60 text-brand-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="authTrack"
                      value={tr}
                      checked={authTrack === tr}
                      onChange={() => setAuthTrack(tr)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{tr}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cargo/Função */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cargo / Função nesta formação
            </label>
            <select
              value={authRole}
              onChange={(e) => setAuthRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {roleList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Outro">Outro cargo</option>
            </select>
          </div>

          {/* Escola de lotação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Escola / Lotação Atual
            </label>
            <select
              value={authSchool}
              onChange={(e) => setAuthSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {schoolList.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isAuthPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-brand-700 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isAuthPending ? (
              <span>Confirmando inscrição...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Minha Inscrição Nesta Formação</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Cursista deslogado: Formulário completo de auto-inscrição
  const actionFn = async (prevState: any, formData: FormData) => {
    // Resolve escola final
    const finalSchool = selectedSchool === "OUTRA" ? customSchool : selectedSchool;
    formData.set("school", finalSchool);

    // Resolve cargo final
    const finalRole = selectedRole === "OUTRO" ? customRole : selectedRole;
    formData.set("function", finalRole);

    if (selectedTrack) {
      formData.set("track", selectedTrack);
    }

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
          Inscrição de Professor Cursista
        </div>
        <h3 className="font-bold text-slate-900 text-xl">Preencha seus dados para garantir sua vaga</h3>
        <p className="text-xs text-slate-500 mt-1">
          Seu cadastro será gerado automaticamente e você terá acesso imediato à lista de presença e ao registro de frequência.
        </p>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Bloco 1: Identificação Pessoal */}
        <div className="space-y-3 pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            1. Identificação do Participante
          </span>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Nascimento *
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="birthDate"
                name="birthDate"
                required
                value={birthDate}
                onChange={handleBirthDateChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Sua data de nascimento será sua senha inicial de acesso (DDMMAAAA).
          </p>

          {/* Telefone / WhatsApp e Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Telefone / WhatsApp {isPhoneRequired ? "*" : "(Opcional)"}
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                required={isPhoneRequired}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(84) 90000-0000"
                maxLength={15}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
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
        </div>

        {/* Bloco 2: Informações Profissionais e Formação */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            2. Informações Profissionais
          </span>

          {/* Cargo / Função Selecionável */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Cargo / Função *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roleList.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left font-medium transition cursor-pointer ${
                    selectedRole === role
                      ? "border-brand-500 bg-brand-50/70 text-brand-900 font-bold shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedRole === role ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                  }`}>
                    {selectedRole === role && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{role}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedRole("OUTRO")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left font-medium transition cursor-pointer ${
                  selectedRole === "OUTRO"
                    ? "border-brand-500 bg-brand-50/70 text-brand-900 font-bold shadow-2xs"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedRole === "OUTRO" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                }`}>
                  {selectedRole === "OUTRO" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>Outro Cargo / Função</span>
              </button>
            </div>

            {selectedRole === "OUTRO" && (
              <div className="pt-1">
                <input
                  type="text"
                  required
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Especifique seu cargo ou função (ex: Coordenador Pedagógico)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/20"
                />
              </div>
            )}
          </div>

          {/* Trilha Formativa (se configurada para o curso) */}
          {trackList.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                Trilha Formativa da qual participará *
              </label>
              <div className="space-y-2">
                {trackList.map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => setSelectedTrack(track)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-xs text-left transition cursor-pointer ${
                      selectedTrack === track
                        ? "border-brand-500 bg-brand-50/80 text-brand-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      selectedTrack === track ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                    }`}>
                      {selectedTrack === track && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{track}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Escola de Lotação */}
          <div className="space-y-2 pt-1">
            <label htmlFor="schoolSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
              Escola / Unidade de Lotação *
            </label>
            <div className="relative">
              <select
                id="schoolSelect"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 pr-10 font-medium cursor-pointer"
              >
                <option value="" disabled>Selecione sua escola na lista...</option>
                {schoolList.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch}
                  </option>
                ))}
                <option value="OUTRA">Outra escola (digitar nome)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedSchool === "OUTRA" && (
              <div className="pt-1">
                <input
                  type="text"
                  required
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  placeholder="Digite o nome completo da sua escola..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-bold py-4 px-6 rounded-xl hover:bg-brand-700 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span>Processando sua inscrição...</span>
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

