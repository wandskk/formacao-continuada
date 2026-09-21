"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importCursistasAction } from "@/actions/courses";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  UserPlus, 
  Users
} from "lucide-react";

interface ImportModalProps {
  courseId: string;
  courseTitle: string;
  triggerButton?: React.ReactNode;
}

export function ImportSpreadsheetModal({ courseId, courseTitle, triggerButton }: ImportModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMsg("Selecione um arquivo de planilha.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      setErrorMsg(null);
      setResult(null);
      const res = await importCursistasAction(courseId, formData);
      if (res.success && res.data) {
        setResult(res.data);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Erro ao processar a planilha.");
        if (res.data) {
          setResult(res.data);
        }
      }
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-white text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition shadow-sm"
        >
          <Upload className="w-4 h-4 text-brand-600" />
          <span>Importar Cursistas (Planilha)</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Importar Cursistas em Lote</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{courseTitle}</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Baixar Modelo */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Planilha Modelo Oficial</p>
                  <p className="text-[11px] text-slate-500">
                    Colunas: Nome, CPF, Data Nascimento, Escola, Cargo, Email e Telefone.
                  </p>
                </div>
                <a
                  href="/api/planilhas/modelo"
                  download
                  className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white text-brand-700 text-xs font-bold px-3 py-2 rounded-xl border border-brand-200 hover:bg-blue-50 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Modelo XLSX
                </a>
              </div>

              {/* Área de Upload / Dropzone */}
              {!result && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                      selectedFile
                        ? "border-brand-500 bg-brand-50/30"
                        : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>

                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Clique para trocar de arquivo
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Arraste o arquivo ou clique para selecionar
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Suporta arquivos Excel (.xlsx, .xls) ou texto (.csv)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mensagem de Erro Geral */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Atenção: </span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Resultado da Importação */}
              {result && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Processamento de Planilha Concluído!
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-emerald-100 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Processados</span>
                        <span className="font-extrabold text-slate-800 text-base">{result.totalProcessed}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Novas Contas</span>
                        <span className="font-extrabold text-emerald-600 text-base">{result.newUsersCreated}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Matriculados</span>
                        <span className="font-extrabold text-brand-600 text-base">{result.enrollmentsCreated}</span>
                      </div>
                    </div>

                    {result.alreadyEnrolled > 0 && (
                      <p className="text-[11px] text-emerald-700">
                        • {result.alreadyEnrolled} cursistas já estavam matriculados nesta turma.
                      </p>
                    )}
                  </div>

                  {/* Lista de Alertas / Linhas com Erro */}
                  {result.errors && result.errors.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2 max-h-40 overflow-y-auto">
                      <span className="font-bold text-amber-900 block">
                        Linhas com avisos ou ignoradas ({result.errors.length}):
                      </span>
                      <ul className="space-y-1 text-amber-800">
                        {result.errors.map((err: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="font-semibold">{err.row > 0 ? `Linha ${err.row}:` : "•"}</span>
                            <span>{err.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition"
              >
                {result ? "Fechar" : "Cancelar"}
              </button>

              {!result && (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isPending}
                  className="inline-flex items-center gap-2 bg-brand-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-sm disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando Planilha...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Importar Cursistas</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
