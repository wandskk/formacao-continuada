import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  School, 
  BookOpen, 
  Clock, 
  Percent, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowLeft,
  FileText,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { PublicEnrollmentForm } from "@/components/courses/public-enrollment-form";
import { CourseStatus } from "@prisma/client";

interface PublicInscricaoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicInscricaoPage({ params }: PublicInscricaoPageProps) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  let isAlreadyEnrolled = false;
  if (currentUser) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: course.id,
        },
      },
    });
    isAlreadyEnrolled = !!enrollment;
  }

  const isOpen = course.status === CourseStatus.OPEN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Institucional */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-tight block">
                Formação Continuada
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Selo Alfabetização MEC • Rede Municipal de Ensino
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href={
                  currentUser.role === "ADMIN"
                    ? "/admin"
                    : currentUser.role === "INSTRUTOR"
                    ? "/instrutor"
                    : "/cursista"
                }
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
              >
                <span>Meu Painel</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-xl transition"
              >
                <span>Acessar com CPF</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Informações da Formação */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isOpen ? "Inscrições Abertas" : "Inscrições Encerradas"}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Formação Presencial
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>

            {/* Grid de Informações Chave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Carga Horária
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span className="text-lg font-bold text-slate-900">{course.totalHours} horas</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Presença Mínima
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span className="text-lg font-bold text-slate-900">{course.minFrequency}%</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Certificação
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-slate-900">Autenticável MEC</span>
                </div>
              </div>
            </div>

            {/* Público-Alvo */}
            {course.targetAudience && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Público-Alvo</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {course.targetAudience}
                </p>
              </div>
            )}

            {/* Ementa e Programa */}
            {course.syllabus && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Conteúdo Programático e Ementa
                  </h3>
                </div>
                <div className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100">
                  {course.syllabus}
                </div>
              </div>
            )}

            {/* Garantias e Conformidade */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-brand-100 text-xs text-slate-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">
                  Validação Oficial para o Selo Compromisso com a Alfabetização:
                </span>{" "}
                O controle de presença é computado por sessão via QR Code e os certificados emitidos
                conterão código autenticável e hash criptográfico nos termos dos Itens 22 e 35 do Edital.
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Inscrição */}
          <div className="lg:col-span-5 sticky top-8">
            {isOpen ? (
              <PublicEnrollmentForm
                courseSlug={course.slug}
                courseId={course.id}
                currentUser={currentUser}
                isAlreadyEnrolled={isAlreadyEnrolled}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Inscrições Não Disponíveis</h3>
                <p className="text-xs text-slate-500">
                  O período de matrículas para esta formação foi finalizado ou a turma já iniciou as atividades.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline"
                >
                  Entrar no sistema para consultar certificados
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
