import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseForm } from "@/components/courses/course-form";
import Link from "next/link";
import { ArrowLeft, BookPlus } from "lucide-react";

export default async function AdminNovoCursoPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cursos"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
            title="Voltar para a lista de cursos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BookPlus className="w-5 h-5 text-brand-600" />
              <h1 className="text-2xl font-bold text-slate-900">Cadastrar Nova Formação Continuada</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Defina os parâmetros do curso, ementa oficial para o verso do certificado e gere o link de inscrição.
            </p>
          </div>
        </div>

        <CourseForm />
      </main>
    </div>
  );
}
