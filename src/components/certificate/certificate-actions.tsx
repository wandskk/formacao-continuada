"use client";

import { Printer, ShieldCheck, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface CertificateActionsProps {
  code: string;
}

export function CertificateActions({ code }: CertificateActionsProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:hidden sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/cursista"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </Link>
          <div className="hidden sm:block">
            <span className="text-xs text-slate-400">Certificado Oficial: </span>
            <span className="text-xs font-mono font-bold text-amber-300">{code}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/validar/${encodeURIComponent(code)}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl transition border border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verificar Validação Pública</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Salvar em PDF / Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
