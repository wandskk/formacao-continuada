import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect, notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseForm } from "@/components/courses/course-form";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

interface EditarCursoPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditarCursoPage({ params }: EditarCursoPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/cursos/${course.id}`}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
            title="Voltar aos detalhes da formação"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-brand-600" />
              <h1 className="text-2xl font-bold text-slate-900">Editar Formação: {course.title}</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Altere informações cadastrais, carga horária ou atualize a ementa oficial.
            </p>
          </div>
        </div>

        <CourseForm initialData={course} />
      </main>
    </div>
  );
}
