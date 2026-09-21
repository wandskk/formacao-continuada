"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { EnrollmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { calculateCourseFrequencyData } from "@/lib/frequency";

export type ActionResponse<T = any> = {
  success?: boolean;
  error?: string;
  data?: T;
};

/**
 * Homologação individual de um cursista pela Secretaria de Educação (DEC-005)
 */
export async function homologateEnrollmentAction(enrollmentId: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado. Apenas administradores da Secretaria podem homologar cursistas." };
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      return { error: "Matrícula não encontrada." };
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        homologatedAt: new Date(),
        homologatedBy: currentUser.id,
        status: EnrollmentStatus.APPROVED,
      },
    });

    revalidatePath(`/admin/cursos/${enrollment.courseId}/frequencia`);
    revalidatePath(`/admin/cursos/${enrollment.courseId}`);
    revalidatePath(`/admin/cursos/${enrollment.courseId}/relatorio-mec`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao homologar matrícula:", error);
    return { error: "Erro ao homologar cursista." };
  }
}

/**
 * Homologação em lote de todos os cursistas com frequência mínima atingida (DEC-005)
 */
export async function homologateBatchCourseAction(
  courseId: string
): Promise<ActionResponse<{ homologatedCount: number }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado." };
  }

  try {
    const report = await calculateCourseFrequencyData(courseId);
    if (!report) {
      return { error: "Formação não encontrada." };
    }

    // Filtra cursistas aptos que ainda não foram homologados
    const eligibleEnrollments = report.cursistas.filter(
      (c) => c.isApproved && !c.isHomologated
    );

    if (eligibleEnrollments.length === 0) {
      return {
        success: true,
        data: { homologatedCount: 0 },
      };
    }

    const eligibleIds = eligibleEnrollments.map((c) => c.enrollmentId);

    await prisma.enrollment.updateMany({
      where: {
        id: { in: eligibleIds },
      },
      data: {
        homologatedAt: new Date(),
        homologatedBy: currentUser.id,
        status: EnrollmentStatus.APPROVED,
      },
    });

    revalidatePath(`/admin/cursos/${courseId}/frequencia`);
    revalidatePath(`/admin/cursos/${courseId}`);
    revalidatePath(`/admin/cursos/${courseId}/relatorio-mec`);

    return {
      success: true,
      data: { homologatedCount: eligibleIds.length },
    };
  } catch (error) {
    console.error("Erro na homologação em lote:", error);
    return { error: "Erro interno ao homologar cursistas da turma." };
  }
}

/**
 * Estorno de homologação para permitir correções ou revisão de presença
 */
export async function revertHomologationAction(enrollmentId: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado." };
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { certificate: true },
    });

    if (!enrollment) {
      return { error: "Matrícula não encontrada." };
    }

    if (enrollment.certificate) {
      return { error: "Não é possível estornar uma homologação com certificado já emitido." };
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        homologatedAt: null,
        homologatedBy: null,
        status: EnrollmentStatus.IN_PROGRESS,
      },
    });

    revalidatePath(`/admin/cursos/${enrollment.courseId}/frequencia`);
    revalidatePath(`/admin/cursos/${enrollment.courseId}`);
    revalidatePath(`/admin/cursos/${enrollment.courseId}/relatorio-mec`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao estornar homologação:", error);
    return { error: "Erro ao desfazer homologação." };
  }
}
