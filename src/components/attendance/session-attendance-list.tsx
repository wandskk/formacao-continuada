"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maskCPF } from "@/lib/utils";
import { removeAttendanceAction } from "@/actions/sessions";
import { ManualAttendanceModal } from "./manual-attendance-modal";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  CheckSquare, 
  Trash2, 
  AlertCircle,
  Loader2,
  XCircle,
  School
} from "lucide-react";
import { CheckInType } from "@prisma/client";

interface AttendanceRecord {
  id: string;
  checkInAt: Date;
  method: CheckInType;
  justification?: string | null;
  manualRegisteredBy?: string | null;
  user: {
    id: string;
    name: string;
    cpf: string;
    school?: string | null;
    function?: string | null;
  };
}

interface EnrolledUser {
  user: {
    id: string;
    name: string;
    cpf: string;
    school?: string | null;
    function?: string | null;
  };
}

interface SessionAttendanceListProps {
  sessionId: string;
  attendances: AttendanceRecord[];
  enrollments: EnrolledUser[];
}

export function SessionAttendanceList({
  sessionId,
  attendances,
  enrollments,
}: SessionAttendanceListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "present" | "absent">("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mapeia IDs dos presentes
  const presentUserMap = new Map<string, AttendanceRecord>();
  attendances.forEach((att) => {
    presentUserMap.set(att.user.id, att);
  });

  // Lista consolidada de todos os cursistas matriculados
  const combinedList = enrollments.map((enr) => {
    const attendance = presentUserMap.get(enr.user.id);
    return {
      user: enr.user,
      isPresent: !!attendance,
      attendanceRecord: attendance || null,
    };
  });

  const presentCount = attendances.length;
  const totalCount = enrollments.length;
  const absentCount = Math.max(0, totalCount - presentCount);

  // Filtragem
  const filtered = combinedList.filter((item) => {
    if (activeTab === "present" && !item.isPresent) return false;
    if (activeTab === "absent" && item.isPresent) return false;

    if (!search) return true;
    const term = search.toLowerCase();
    const nameMatch = item.user.name.toLowerCase().includes(term);
    const cpfMatch = item.user.cpf.includes(term);
    const schoolMatch = (item.user.school || "").toLowerCase().includes(term);
    return nameMatch || cpfMatch || schoolMatch;
  });

  const handleRemoveAttendance = (attendanceId: string, userName: string) => {
    if (!confirm(`Deseja estornar a presença do cursista ${userName}?`)) {
      return;
    }

    setDeletingId(attendanceId);
    startTransition(async () => {
      await removeAttendanceAction(attendanceId);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Abas e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("present")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "present" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Presentes ({presentCount})</span>
          </button>
          <button
            onClick={() => setActiveTab("absent")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "absent" ? "bg-amber-600 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Ausentes / Pendentes ({absentCount})</span>
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF ou escola..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Tabela de Presenças */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Nenhum cursista encontrado nesta visualização.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Cursista</th>
                  <th className="py-3.5 px-4">Escola de Lotação</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4">Horário / Justificativa</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ user, isPresent, attendanceRecord }) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        CPF: {maskCPF(user.cpf)} {user.function ? `• ${user.function}` : ""}
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

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Presente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Pendente
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPresent && attendanceRecord ? (
                        attendanceRecord.method === "QR_CODE" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-brand-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                            <QrCode className="w-3 h-3" />
                            QR Code
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            <CheckSquare className="w-3 h-3" />
                            Manual
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {isPresent && attendanceRecord ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            {new Date(attendanceRecord.checkInAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {attendanceRecord.justification && (
                            <div className="text-[10px] text-amber-800 italic mt-0.5 line-clamp-1">
                              {attendanceRecord.justification}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Não registrado</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isPresent && attendanceRecord ? (
                        <button
                          onClick={() => handleRemoveAttendance(attendanceRecord.id, user.name)}
                          disabled={isPending && deletingId === attendanceRecord.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Estornar presença"
                        >
                          {isPending && deletingId === attendanceRecord.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <ManualAttendanceModal
                          sessionId={sessionId}
                          userId={user.id}
                          userName={user.name}
                          userSchool={user.school}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
