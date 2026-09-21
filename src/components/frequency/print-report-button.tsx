"use client";

import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PrintReportButtonProps {
  courseId: string;
}

export function PrintReportButton({ courseId }: PrintReportButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:hidden sticky top-4 z-50 flex items-center justify-between bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl max-w-4xl mx-auto mb-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/cursos/${courseId}/frequencia`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </Link>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-300">Modo de Visualização para Impressão A4</span>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={`/api/cursos/${courseId}/relatorio-mec/excel`}
          download
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Baixar Excel</span>
        </a>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>
    </div>
  );
}
