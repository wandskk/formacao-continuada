"use client";

import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { School, LogOut, User } from "lucide-react";
import { formatCPF } from "@/lib/utils";

interface DashboardHeaderProps {
  user: {
    name: string;
    cpf: string;
    role: "ADMIN" | "INSTRUTOR" | "CURSISTA";
    school?: string | null;
    function?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const roleBadgeConfig = {
    ADMIN: { label: "Secretaria / Admin", bg: "bg-blue-100 text-blue-800 border-blue-200" },
    INSTRUTOR: { label: "Formador / Instrutor", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    CURSISTA: { label: "Professor / Cursista", bg: "bg-purple-100 text-purple-800 border-purple-200" },
  }[user.role];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Institucional */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 text-white p-2 rounded-xl shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base leading-tight block">Formação Continuada</span>
            <span className="text-xs text-slate-500 hidden sm:block">Selo Alfabetização MEC</span>
          </div>
        </div>

        {/* Informações do Usuário & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-2">
              <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeConfig.bg}`}>
                {roleBadgeConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              CPF: {formatCPF(user.cpf)} {user.school ? `• ${user.school}` : ""}
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
