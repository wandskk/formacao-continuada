"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { checkInAction } from "@/actions/sessions";
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Award, 
  Clock, 
  Sparkles,
  SwitchCamera
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function QrScanner() {
  const router = useRouter();
  const [scannerStarted, setScannerStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrRegionId = "qr-reader-viewport";
    const scanner = new Html5Qrcode(qrRegionId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    html5QrCodeRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scanner
      .start(
        { facingMode },
        config,
        async (decodedText) => {
          // Quando lê um QR Code
          handleQrCodeScanned(decodedText);
        },
        (error) => {
          // Erro contínuo de frame sem QR Code (normal, ignorar)
        }
      )
      .then(() => setScannerStarted(true))
      .catch((err) => {
        console.error("Erro ao iniciar câmera:", err);
        setErrorMessage(
          "Não foi possível acessar a câmera do dispositivo. Verifique as permissões do seu navegador."
        );
      });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e) => console.error("Erro ao parar câmera:", e));
      }
    };
  }, [facingMode]);

  const handleQrCodeScanned = async (decodedText: string) => {
    if (isProcessing || successData) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Extrai parâmetros do QR Code (suporta URLs no formato /checkin?s=SESSION_ID&t=TOKEN)
      let sessionId = "";
      let qrToken = "";

      if (decodedText.includes("checkin?")) {
        const url = new URL(decodedText, window.location.origin);
        sessionId = url.searchParams.get("s") || "";
        qrToken = url.searchParams.get("t") || "";
      } else {
        // Tenta parse de JSON caso seja enviado payload direto
        try {
          const parsed = JSON.parse(decodedText);
          sessionId = parsed.sessionId || parsed.s;
          qrToken = parsed.qrToken || parsed.t;
        } catch {
          // Formato com separador s:t
          const parts = decodedText.split(":");
          if (parts.length === 2) {
            sessionId = parts[0];
            qrToken = parts[1];
          }
        }
      }

      if (!sessionId || !qrToken) {
        setErrorMessage("Código QR não reconhecido como chamada oficial do sistema.");
        setIsProcessing(false);
        return;
      }

      // Para a câmera enquanto processa a chamada
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const res = await checkInAction({ sessionId, qrToken });
      if (res.success && res.data) {
        setSuccessData(res.data);
      } else {
        setErrorMessage(res.error || "Erro ao registrar presença.");
      }
    } catch (err) {
      console.error("Erro ao processar leitura do QR:", err);
      setErrorMessage("Falha ao ler o código. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const restartScanner = async () => {
    setSuccessData(null);
    setErrorMessage(null);
    if (html5QrCodeRef.current) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
      await html5QrCodeRef.current.start(
        { facingMode },
        config,
        (decodedText) => handleQrCodeScanned(decodedText),
        () => {}
      );
      setScannerStarted(true);
    }
  };

  const toggleCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Tela de Sucesso */}
      {successData && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-5 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Presença Confirmada!
            </span>
            <h2 className="text-xl font-bold text-slate-900 pt-2">{successData.courseTitle}</h2>
            <p className="text-xs text-slate-500">{successData.sessionTitle || "Encontro Presencial"}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-slate-400 block">Horas Computadas</span>
              <span className="font-extrabold text-slate-900 text-base">{successData.hours} horas</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-400 block">Registro de Horário</span>
              <span className="font-extrabold text-brand-600 text-base">
                {new Date(successData.checkInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/cursista"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-brand-700 transition shadow-md text-sm"
            >
              <Award className="w-4 h-4" />
              <span>Voltar ao Meu Painel</span>
            </Link>
          </div>
        </div>
      )}

      {/* Câmera e Scanner */}
      {!successData && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Leitor de Presença</h3>
            </div>

            <button
              onClick={toggleCamera}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition"
              title="Trocar Câmera"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>Inverter</span>
            </button>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Viewport do Scanner */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square flex items-center justify-center">
              <div id="qr-reader-viewport" className="w-full h-full" />

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-10">
                  <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
                  <span className="text-xs font-bold">Validando presença no MEC...</span>
                </div>
              )}
            </div>

            {/* Mensagem de Erro */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={restartScanner}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline pt-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Tentar novamente
                </button>
              </div>
            )}

            <p className="text-xs text-center text-slate-500 leading-relaxed">
              Enquadre o QR Code dinâmico projetado na sala de aula para registrar sua presença.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
