"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseAction, updateCourseAction, ActionResponse } from "@/actions/courses";
import { CourseStatus } from "@prisma/client";
import { 
  BookOpen, 
  Clock, 
  Percent, 
  Calendar, 
  Users, 
  FileText, 
  Check, 
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/slug";

interface CourseFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    targetAudience?: string | null;
    syllabus?: string | null;
    totalHours: number;
    minFrequency: number;
    status: CourseStatus;
    startDate?: Date | null;
    endDate?: Date | null;
  };
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [syllabus, setSyllabus] = useState(initialData?.syllabus || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugManuallyEdited && !isEditing) {
      setSlug(slugify(newTitle));
    }
  };

  const actionFn = async (prevState: any, formData: FormData) => {
    if (isEditing) {
      const res = await updateCourseAction(initialData.id, prevState, formData);
      if (res.success) {
        router.push(`/admin/cursos/${initialData.id}`);
        router.refresh();
      }
      return res;
    } else {
      const res = await createCourseAction(prevState, formData);
      if (res.success && res.data) {
        router.push(`/admin/cursos/${res.data.id}`);
        router.refresh();
      }
      return res;
    }
  };

  const [state, formAction, isPending] = useActionState(actionFn, null);

  return (
    <form action={formAction} className="space-y-8 max-w-4xl mx-auto">
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Seção 1: Identificação do Curso */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Identificação da Formação</h2>
            <p className="text-xs text-slate-500">Dados cadastrais básicos visíveis aos cursistas e no relatório MEC</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título da Formação *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="Ex: Alfabetização e Letramento nos Anos Iniciais do EF"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slug" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                Slug para Link de Inscrição *
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <span className="text-xs text-slate-400 pl-3 pr-1 select-none">/inscricao/</span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="alfabetizacao-anos-iniciais"
                  className="w-full py-3 pr-3 bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Identificador único do link público de inscrição</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status da Turma *
              </label>
              <select
                id="status"
                name="status"
                defaultValue={initialData?.status || CourseStatus.OPEN}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 font-medium"
              >
                <option value={CourseStatus.OPEN}>Inscrições Abertas (OPEN)</option>
                <option value={CourseStatus.IN_PROGRESS}>Em Andamento (IN_PROGRESS)</option>
                <option value={CourseStatus.DRAFT}>Rascunho / Não Publicado (DRAFT)</option>
                <option value={CourseStatus.COMPLETED}>Concluído / Encerrado (COMPLETED)</option>
                <option value={CourseStatus.ARCHIVED}>Arquivado (ARCHIVED)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Público-Alvo
            </label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              defaultValue={initialData?.targetAudience || ""}
              placeholder="Ex: Professores do 1º e 2º ano da Rede Municipal, Coordenadores Pedagógicos"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição Resumida (Opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={initialData?.description || ""}
              placeholder="Apresentação breve da formação para a página pública de divulgação..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Carga Horária, Frequência e Período */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Carga Horária e Requisitos do MEC</h2>
            <p className="text-xs text-slate-500">Parâmetros oficiais para cálculo de presença e certificação (Item 22)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="totalHours" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Carga Horária (h) *
            </label>
            <input
              type="number"
              id="totalHours"
              name="totalHours"
              required
              min={1}
              defaultValue={initialData?.totalHours || 40}
              placeholder="40"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 font-semibold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Horas totais de formação</p>
          </div>

          <div>
            <label htmlFor="minFrequency" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              Presença Mínima (%) *
            </label>
            <input
              type="number"
              id="minFrequency"
              name="minFrequency"
              required
              min={0}
              max={100}
              step={1}
              defaultValue={initialData?.minFrequency || 75}
              placeholder="75"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 font-semibold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Mínimo para certificação (Edital)</p>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data de Início
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data de Término
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Seção 3: Ementa para o Verso do Certificado (Item 35) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg">Ementa e Conteúdo Programático</h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Item 35 do Edital MEC
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Obrigatório: este texto será impresso integralmente no verso dos certificados emitidos.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            id="syllabus"
            name="syllabus"
            rows={8}
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder="Ex: Módulo 1: Fundamentos da Alfabetização e Consciência Fonológica (10h).&#10;Módulo 2: Práticas pedagógicas para leitura e escrita nos anos iniciais (15h).&#10;Módulo 3: Avaliação formativa e intervenção pedagógica na alfabetização (15h)..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dica: Separe módulos e tópicos em parágrafos claros.</span>
            <span>{syllabus.length} caracteres</span>
          </div>
        </div>
      </div>

      {/* Ações de Envio */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:bg-brand-700 transition shadow-md disabled:opacity-50"
        >
          {isPending ? (
            <span>Salvando...</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Atualizar Formação" : "Cadastrar Formação"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
