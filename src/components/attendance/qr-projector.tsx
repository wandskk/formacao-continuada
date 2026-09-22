"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { 
  Maximize, 
  Minimize, 
  Users, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  School
} from "lucide-react";
import Link from "next/link";

interface QrProjectorProps {
  sessionId: string;
  initialToken: string;
  courseTitle: string;
  sessionTitle: string | null;
  hours: number;
  date: Date;
  initialAttendeesCount: number;
}

export function QrProjector({
  sessionId,
  initialToken,
  courseTitle,
  sessionTitle,
  hours,
  date,
  initialAttendeesCount,
}: QrProjectorProps) {
  const [token, setToken] = useState(initialToken);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const ROTATION_SECONDS = 300; // 5 minutos (300 segundos) para permitir login tranquilo
  const [attendeesCount, setAttendeesCount] = useState(initialAttendeesCount);
  const [recentAttendees, setRecentAttendees] = useState<{ name: string; school?: string | null }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROTATION_SECONDS);
  const [isActive, setIsActive] = useState(true);

  // Formata o tempo restante de forma amigável (ex: 4m 32s ou 45s)
  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}m ${s.toString().padStart(2, "0")}s`;
    }
    return `${s}s`;
  };

  // Gera o QR Code com a URL absoluta para check-in
  useEffect(() => {
    if (!token) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const checkInUrl = `${origin}/checkin?s=${sessionId}&t=${token}`;

    QRCode.toDataURL(checkInUrl, {
      width: 440,
      margin: 2,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Erro ao gerar QR Code:", err));
  }, [token, sessionId]);

  // Sincroniza imediatamente ao abrir a tela para garantir token fresco e estatísticas em tempo real
  useEffect(() => {
    fetchNewToken();
  }, [sessionId]);

  // Loop de contagem regressiva por segundo
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchNewToken();
          return ROTATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, isActive]);

  // Polling a cada 10s para atualizar lista de presentes ao vivo e sincronizar relógio com o servidor
  useEffect(() => {
    if (!isActive) return;

    const pollTimer = setInterval(() => {
      fetchNewToken();
    }, 10000);

    return () => clearInterval(pollTimer);
  }, [sessionId, isActive]);

  // Busca novo token rotativo e estatísticas da sessão
  const fetchNewToken = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/token?_t=${Date.now()}`, { 
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.qrToken) {
          setToken(data.qrToken);
        }
        setIsActive(data.isActive);
        setAttendeesCount(data.attendeesCount);
        if (data.recentAttendees) {
          setRecentAttendees(data.recentAttendees);
        }
        if (typeof data.remainingSeconds === "number") {
          setTimeLeft(data.remainingSeconds);
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar token dinâmico:", err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Barra Superior do Projetor */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-600 p-2.5 rounded-2xl shadow-lg">
            <School className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-brand-400 uppercase">
              Selo Alfabetização MEC • Chamada Oficial
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
              {courseTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Contador de Presentes */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-md">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-2xl font-black text-emerald-400 leading-none">
                {attendeesCount}
              </span>
              <span className="text-xs text-slate-400 ml-2 font-semibold">
                presentes
              </span>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-800 transition"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Área Central: QR Code Dinâmico e Instruções de Sala */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 py-8 max-w-6xl mx-auto w-full">
        {/* Moldura do QR Code */}
        <div className="flex flex-col items-center">
          <div className="relative p-6 bg-white rounded-3xl shadow-2xl border-4 border-brand-500/30 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code de Presença Dinâmica"
                className="w-72 sm:w-80 md:w-96 h-auto rounded-xl"
              />
            ) : (
              <div className="w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin text-slate-400" />
              </div>
            )}

            {/* Selo Anti-Fraude Dinâmico */}
            <div className="absolute -top-3.5 bg-slate-900 text-brand-400 text-[11px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full border border-slate-700 shadow-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              Token Rotativo Anti-Fraude
            </div>
          </div>

          {/* Barra de Progresso da Rotação (5min / 300s) */}
          <div className="w-full mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Atualização em
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-brand-400 font-bold tracking-wide">
                  {formatTimeLeft(timeLeft)}
                </span>
                <button
                  onClick={fetchNewToken}
                  className="text-slate-400 hover:text-brand-300 transition p-0.5 rounded hover:bg-slate-800"
                  title="Renovar QR Code manualmente agora"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(timeLeft / ROTATION_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Painel Lateral: Instruções e Check-ins Recentes */}
        <div className="flex-1 space-y-6 max-w-lg">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-xs font-bold border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Como registrar sua presença:
            </div>

            <ol className="space-y-3 text-sm sm:text-base text-slate-200">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Abra a câmera do seu smartphone (ou o app de leitura de QR Code).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Aponte para o QR Code projetado na tela.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Toque no link e confirme seu CPF para registrar sua presença instantânea!</span>
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              💡 Não tem celular ou está sem internet? Solicite a <strong className="text-slate-200">baixa manual</strong> ao formador da sala.
            </div>
          </div>

          {/* Últimos Professores que Confirmaram Presença (Ticker ao Vivo) */}
          {recentAttendees.length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Últimas presenças confirmadas ao vivo:
              </span>
              <div className="space-y-1.5">
                {recentAttendees.slice(0, 3).map((attendee, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs text-slate-200 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {attendee.name}
                    </span>
                    <span className="text-slate-400 text-[11px] line-clamp-1">
                      {attendee.school || "Rede Municipal"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Informativo */}
      <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-500 gap-2">
        <div>
          Encontro: <strong className="text-slate-300">{sessionTitle || "Encontro Presencial"}</strong> • {hours}h computadas • {new Date(date).toLocaleDateString("pt-BR")}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/instrutor/sessao/${sessionId}`}
            className="text-brand-400 hover:text-brand-300 font-semibold transition"
          >
            Acessar Painel de Baixa Manual &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
