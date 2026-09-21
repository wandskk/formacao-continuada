import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formação Continuada | Gestão de Formações e Certificação",
  description: "Plataforma de gestão de presença, frequência e certificação autenticável para a rede municipal de ensino (Selo MEC).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
