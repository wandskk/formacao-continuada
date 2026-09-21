"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeEnrollmentAction } from "@/actions/courses";
import { maskCPF } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  School, 
  Briefcase,
  AlertCircle,
  Loader2
} from "lucide-react";

interface EnrollmentItem {
  id: string;
  enrolledAt: Date;
  status: string;
  user: {
    id: string;
    name: string;
    cpf: string;
    school?: string | null;
    function?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  certificate?: any | null;
}

interface EnrollmentTableProps {
  courseId: string;
  enrollments: EnrollmentItem[];
}

export function EnrollmentTable({ courseId, enrollments }: EnrollmentTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = enrollments.filter((e) => {
    const term = search.toLowerCase();
    const nameMatch = e.user.name.toLowerCase().includes(term);
    const cpfMatch = e.user.cpf.includes(term);
    const schoolMatch = (e.user.school || "").toLowerCase().includes(term);
    const functionMatch = (e.user.function || "").toLowerCase().includes(term);
    return nameMatch || cpfMatch || schoolMatch || functionMatch;
  });

  const handleRemove = async (enrollmentId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja desmatricular o cursista ${userName}?`)) {
      return;
    }

    setDeletingId(enrollmentId);
    setActionError(null);

    startTransition(async () => {
      const res = await removeEnrollmentAction(enrollmentId);
      setDeletingId(null);
      if (res.success) {
        router.refresh();
      } else {
        setActionError(res.error || "Erro ao desmatricular.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Barra de Busca e Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome, CPF ou escola..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 self-start sm:self-center">
          Mostrando <span className="text-slate-900 font-bold">{filtered.length}</span> de{" "}
          <span className="text-slate-900 font-bold">{enrollments.length}</span> cursistas
        </div>
      </div>

      {/* Tabela de Cursistas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-base">Nenhum cursista encontrado</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? "Nenhum resultado corresponde à sua pesquisa."
                : "Ainda não há professores matriculados nesta formação. Divulgue o link público ou importe uma planilha."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Cursista (Professor)</th>
                  <th className="py-3.5 px-4">Escola / Lotação</th>
                  <th className="py-3.5 px-4">Cargo / Função</th>
                  <th className="py-3.5 px-4">Data Inscrição</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((enrollment) => {
                  const { user } = enrollment;
                  return (
                    <tr key={enrollment.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>CPF: {maskCPF(user.cpf)}</span>
                          {user.phone && <span>• {user.phone}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {user.school ? (
                          <div className="flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">{user.school}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Não informada</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {user.function ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">{user.function}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Professor</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(enrollment.enrolledAt).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-brand-700 border border-brand-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {enrollment.status === "IN_PROGRESS" ? "Matriculado" : enrollment.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleRemove(enrollment.id, user.name)}
                          disabled={isPending && deletingId === enrollment.id}
                          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Desmatricular cursista"
                        >
                          {isPending && deletingId === enrollment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
