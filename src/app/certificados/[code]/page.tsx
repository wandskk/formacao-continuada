import { notFound } from "next/navigation";
import { getCertificateDetailsByCode } from "@/lib/certificate";
import { CertificateActions } from "@/components/certificate/certificate-actions";
import { ShieldCheck, Award, BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface CertificatePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { code } = await params;
  const certificate = await getCertificateDetailsByCode(code);

  if (!certificate) {
    notFound();
  }

  const {
    cursista,
    course,
    homologation,
    metrics,
    sessions,
    issuedAt,
    verificationHash,
    qrCodeDataUrl,
    validationUrl,
  } = certificate;

  const formatDate = (d?: Date | null) => {
    if (!d) return "--/--/----";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(d));
  };

  const formatShortDate = (d?: Date | null) => {
    if (!d) return "--/--/----";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(d));
  };

  const formatDateTime = (d: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  };

  const periodText =
    course.startDate && course.endDate
      ? `${formatDate(course.startDate)} a ${formatDate(course.endDate)}`
      : course.startDate
      ? `iniciado em ${formatDate(course.startDate)}`
      : "durante o ano letivo de 2026";

  return (
    <div className="min-h-screen bg-slate-200/70 font-sans print:bg-white print:min-h-0 text-slate-800">
      {/* Barra superior de ações (oculta na impressão) */}
      <CertificateActions code={certificate.code} />

      {/* Container principal centralizado */}
      <div className="py-8 px-4 print:p-0 flex flex-col items-center gap-10">
        
        {/* ========================================================================= */}
        {/* PÁGINA 1: FRENTE DO CERTIFICADO (A4 PAISAGEM: 297mm x 210mm)              */}
        {/* ========================================================================= */}
        <div
          id="certificate-front"
          className="bg-white w-full max-w-[1122px] min-h-[793px] p-10 md:p-12 shadow-2xl relative flex flex-col justify-between print:shadow-none print:w-[297mm] print:h-[210mm] print:p-8 print:m-0 print:max-w-none print:break-after-page overflow-hidden"
          style={{
            aspectRatio: "297 / 210",
          }}
        >
          {/* Moldura Externa Nobre (Borda ornamental azul e dourada) */}
          <div className="absolute inset-4 border-4 border-slate-900 pointer-events-none rounded-sm"></div>
          <div className="absolute inset-6 border border-amber-600/70 pointer-events-none rounded-sm"></div>
          <div className="absolute inset-7 border border-slate-200 pointer-events-none rounded-sm"></div>

          {/* Cantoneiras ornamentais clássicas */}
          <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-amber-600 pointer-events-none"></div>
          <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-amber-600 pointer-events-none"></div>
          <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-amber-600 pointer-events-none"></div>
          <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-amber-600 pointer-events-none"></div>

          {/* Marca d'água sutil ao fundo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          {/* CABEÇALHO INSTITUCIONAL */}
          <div className="relative z-10 text-center space-y-1 pt-2">
            <div className="flex items-center justify-center gap-4 mb-2">
              {/* Brasão Oficial / Selo */}
              <div className="w-14 h-14 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md font-serif font-black text-xl border-2 border-amber-500">
                SME
              </div>
              <div className="text-left">
                <p className="text-[10px] md:text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Poder Executivo Municipal • Secretaria Municipal de Educação
                </p>
                <p className="text-xs md:text-sm font-black text-slate-900 tracking-wider uppercase">
                  Programa Municipal de Formação Continuada de Professores
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold">
                  <span>Edital nº 7/2026 — Selo Nacional Compromisso com a Alfabetização (MEC)</span>
                </div>
              </div>
            </div>

            {/* Título Oficial do Certificado */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black text-slate-900 tracking-wider pt-2 uppercase">
              Certificado
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-serif italic">
              de Conclusão e Aproveitamento em Formação Continuada
            </p>
          </div>

          {/* CORPO DO TEXTO DE OUTORGA */}
          <div className="relative z-10 px-6 md:px-12 my-auto text-center space-y-4">
            <p className="text-sm md:text-base text-slate-600 font-serif leading-relaxed">
              A Secretaria Municipal de Educação, no uso de suas atribuições legais e em conformidade com as diretrizes do Ministério da Educação, certifica que
            </p>

            {/* Nome do Cursista */}
            <div className="py-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-slate-950 tracking-wide uppercase border-b-2 border-slate-900 inline-block px-4 pb-1">
                {cursista.name}
              </h2>
              <p className="text-xs md:text-sm font-mono font-semibold text-slate-700 mt-1">
                CPF: {cursista.cpfFormatted} {cursista.school ? `• Lotação: ${cursista.school}` : ""}
              </p>
            </div>

            {/* Texto Descritivo da Formação */}
            <p className="text-sm md:text-base text-slate-700 font-serif leading-relaxed max-w-4xl mx-auto">
              concluiu com êxito a ação de formação continuada <strong className="text-slate-950 font-sans font-bold">“{course.title}”</strong>, ministrada no período de <span className="font-semibold">{periodText}</span>, totalizando uma carga horária presencial de <strong className="text-slate-950 font-bold">{course.totalHours} horas</strong> e frequência apurada de <strong className="text-slate-950 font-bold">{metrics.frequencyPercentage}%</strong>, atendendo a todos os requisitos do <strong className="font-semibold">Item 35 do Edital nº 7/2026 do MEC</strong> e da Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/1996).
            </p>
          </div>

          {/* ASSINATURAS E CHANCELA */}
          <div className="relative z-10 grid grid-cols-2 gap-12 px-8 pt-4">
            <div className="text-center">
              <div className="border-t-2 border-slate-800 w-4/5 mx-auto pt-1.5">
                <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">
                  Coordenação Pedagógica / Formador(a)
                </p>
                <p className="text-[10px] md:text-xs text-slate-500">
                  Responsável pelo Acompanhamento e Avaliação
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-slate-800 w-4/5 mx-auto pt-1.5">
                <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">
                  Secretário(a) Municipal de Educação
                </p>
                <p className="text-[10px] md:text-xs text-slate-500">
                  Dirigente Municipal de Educação • Portaria nº 012/2026
                </p>
              </div>
            </div>
          </div>

          {/* RODAPÉ DE SEGURANÇA E VALIDAÇÃO ELETRÔNICA */}
          <div className="relative z-10 mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-4 text-[10px] md:text-xs text-slate-600">
            {/* Bloco de Dados de Validação */}
            <div className="space-y-0.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Código de Autenticidade:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {certificate.code}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Emitido em: {formatDateTime(issuedAt)}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500 truncate">
                <span className="font-semibold text-slate-700">Hash SHA-256:</span>
                <span className="truncate">{verificationHash}</span>
              </div>
              <p className="text-[9px] text-slate-500">
                A validade jurídica deste certificado pode ser verificada em{" "}
                <span className="text-brand-700 font-semibold underline">{validationUrl}</span> ou apontando a câmera para o QR Code ao lado.
              </p>
            </div>

            {/* QR Code de Validação */}
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeDataUrl}
                alt="QR Code de Validação"
                className="w-16 h-16 md:w-20 md:h-20 border border-slate-300 rounded shadow-sm bg-white"
              />
              <span className="text-[8px] font-bold text-slate-700 uppercase mt-0.5">Validar no MEC</span>
            </div>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* PÁGINA 2: VERSO DO CERTIFICADO (A4 PAISAGEM: EMENTA E REGISTRO ACADÊMICO) */}
        {/* ========================================================================= */}
        <div
          id="certificate-back"
          className="bg-white w-full max-w-[1122px] min-h-[793px] p-10 md:p-12 shadow-2xl relative flex flex-col justify-between print:shadow-none print:w-[297mm] print:h-[210mm] print:p-8 print:m-0 print:max-w-none print:break-before-page overflow-hidden"
          style={{
            aspectRatio: "297 / 210",
          }}
        >
          {/* Moldura Sóbria do Verso */}
          <div className="absolute inset-4 border-2 border-slate-400 pointer-events-none rounded-sm"></div>
          <div className="absolute inset-5 border border-slate-200 pointer-events-none rounded-sm"></div>

          {/* Cabeçalho do Verso */}
          <div className="relative z-10 border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-brand-700" />
              <div>
                <h3 className="font-serif font-black text-slate-900 text-sm md:text-base uppercase tracking-wider">
                  Registro Acadêmico e Ementa Oficial da Formação
                </h3>
                <p className="text-[10px] text-slate-500">
                  Certificado nº {certificate.code} • Titular: {cursista.name} (CPF: {cursista.cpfFormatted})
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-500">
              <span className="font-bold text-slate-800">Edital nº 7/2026 - MEC</span>
              <p>Item 22 (Frequência) e Item 35 (Certificação)</p>
            </div>
          </div>

          {/* Conteúdo Central do Verso */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-2">
            {/* Coluna 1 & 2: Ementa e Conteúdo Programático */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  Ementa e Matriz Metodológica
                </h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line text-justify">
                  {course.syllabus || course.description || (
                    "Estudos e práticas aplicadas para a melhoria dos índices de alfabetização na idade certa. Desenvolvimento de competências pedagógicas alinhadas à BNCC e ao Programa Criança Alfabetizada. Avaliação diagnóstica e formativa das habilidades leitoras e escritoras. Práticas pedagógicas inclusivas e lúdicas no ciclo de alfabetização."
                  )}
                </div>
              </div>

              {/* Módulos e Encontros Presenciais */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Encontros Presenciais Integrados ({metrics.attendedSessionsCount} de {metrics.totalSessionsCount} encontros cumpridos)
                </h4>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-1 px-2.5">Data</th>
                        <th className="py-1 px-2.5">Tema / Módulo Presencial</th>
                        <th className="py-1 px-2.5 text-right">C.H.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-2 px-2.5 text-center text-slate-400">
                            Carga horária integralizada conforme programa da formação.
                          </td>
                        </tr>
                      ) : (
                        sessions.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-1 px-2.5 font-mono text-slate-600">{formatShortDate(s.date)}</td>
                            <td className="py-1 px-2.5 font-medium text-slate-800">
                              {s.title || `Módulo ${idx + 1} - Ação Presencial de Alfabetização`}
                            </td>
                            <td className="py-1 px-2.5 text-right font-bold text-slate-700">{s.hours}h</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coluna 3: Livro de Registro e Homologação da Secretaria */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Termo de Registro de Atas
                </h4>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <p><span className="text-slate-500">Livro de Atas:</span> <strong>01-FORM</strong></p>
                  <p><span className="text-slate-500">Folha de Registro:</span> <strong>FL-{certificate.code.slice(-4)}</strong></p>
                  <p><span className="text-slate-500">Número de Registro:</span> <strong>{certificate.code}</strong></p>
                  <p><span className="text-slate-500">Frequência Apurada:</span> <strong className="text-emerald-700">{metrics.frequencyPercentage}% (Mínimo: {course.minFrequency}%)</strong></p>
                  <p><span className="text-slate-500">Data da Homologação:</span> <strong>{formatDate(homologation.homologatedAt || issuedAt)}</strong></p>
                  <p><span className="text-slate-500">Homologado por:</span> <strong>{homologation.homologatedBy || "Secretaria Municipal de Educação"}</strong></p>
                </div>
              </div>

              {/* Fundamentação Legal */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[9px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 uppercase">Fundamentação Legal e Atribuição:</p>
                <p>• Lei Federal nº 9.394/1996 (Diretrizes e Bases da Educação Nacional — Art. 61 e 67).</p>
                <p>• Portaria MEC nº 7/2026 — Compromisso Nacional Criança Alfabetizada.</p>
                <p>• Resolução CNE/CP nº 1/2020 e Resolução Municipal de Formação Continuada.</p>
              </div>

              {/* Carimbo Digital */}
              <div className="border border-dashed border-slate-400 p-2 text-center rounded text-[9px] text-slate-600 bg-white">
                <span className="font-bold uppercase tracking-widest block text-slate-800">Secretaria Municipal de Educação</span>
                <span>Registro Eletrônico Oficial • Atestado em {formatDateTime(issuedAt)}</span>
              </div>
            </div>
          </div>

          {/* Rodapé do Verso */}
          <div className="relative z-10 border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400">
            <span>Certificado digital emitido pelo Sistema de Formação Continuada Municipal</span>
            <span>Página 2 de 2 • Ementa e Atas de Registro</span>
          </div>
        </div>

      </div>
    </div>
  );
}
