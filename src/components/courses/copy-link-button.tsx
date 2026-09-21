"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CopyLinkButtonProps {
  slug: string;
}

export function CopyCourseLinkButton({ slug }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/inscricao/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs"
        title="Copiar link de inscrição"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Link Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copiar Link</span>
          </>
        )}
      </button>

      <Link
        href={`/inscricao/${slug}`}
        target="_blank"
        className="inline-flex items-center gap-1 bg-blue-50 text-brand-700 hover:bg-blue-100 border border-brand-200 text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
        title="Visualizar página pública de inscrição"
      >
        <span>Abrir Página</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
