"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { issueCertificateAction } from "@/actions/certificate";
import { Award, Loader2, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

interface CursistaCertificateButtonProps {
  enrollmentId: string;
  certificateCode?: string | null;
  isHomologated: boolean;
  isApproved: boolean;
  minFrequency: number;
}

export function CursistaCertificateButton({
  enrollmentId,
  certificateCode,
  isHomologated,
  isApproved,
}: CursistaCertificateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Caso 1: Certificado já emitido
  if (certificateCode) {
    return (
      <div className="pt-2">
        <Link
          href={`/certificados/${encodeURIComponent(certificateCode)}`}
          target="_blank"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Award className="w-4 h-4" />
          <span>Visualizar / Baixar Certificado (PDF)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </div>
    );
  }

  // Caso 2: Homologado pela secretaria, pronto para emitir
  if (isHomologated) {
    const handleIssue = () => {
      setError(null);
      startTransition(async () => {
        const res = await issueCertificateAction(enrollmentId);
        if (res.success && res.data) {
          router.push(`/certificados/${encodeURIComponent(res.data.code)}`);
        } else {
          setError(res.error || "Não foi possível emitir o certificado.");
        }
      });
    };

    return (
      <div className="pt-2 space-y-2">
        {error && (
          <p className="text-[11px] text-rose-600 font-semibold">{error}</p>
        )}
        <button
          onClick={handleIssue}
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando Certificado Oficial...</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4 text-amber-300" />
              <span>Emitir Meu Certificado Oficial</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Caso 3: Aprovado em frequência mas aguardando homologação formal
  if (isApproved) {
    return (
      <div className="pt-2">
        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Frequência atingida! Aguardando homologação final pela Secretaria (DEC-005).</span>
        </span>
      </div>
    );
  }

  return null;
}
