"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { generateCertificateCode, generateVerificationHash } from "@/lib/certificate";

/**
 * Emite o certificado oficial para um cursista homologado.
 * Atende estritamente à regra DEC-005 (exige homologação prévia pela Secretaria).
 */
export async function issueCertificateAction(enrollmentId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Não autenticado." };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      return { success: false, error: "Inscrição não encontrada." };
    }

    // Regra de Autorização: O usuário deve ser o próprio cursista ou ter papel de ADMIN/INSTRUTOR
    const isOwner = currentUser.id === enrollment.userId;
    const isStaff = currentUser.role === "ADMIN" || currentUser.role === "INSTRUTOR";

    if (!isOwner && !isStaff) {
      return { success: false, error: "Sem permissão para emitir este certificado." };
    }

    // Regra DEC-005: Homologação Prévia Obrigatória
    if (!enrollment.homologatedAt) {
      return {
        success: false,
        error:
          "Esta inscrição ainda não foi homologada pela Secretaria Municipal de Educação. O certificado só pode ser emitido após a auditoria e homologação formal (Edital nº 7/2026).",
      };
    }

    // Se o certificado já existe, retorna o código existente (idempotência)
    if (enrollment.certificate) {
      return {
        success: true,
        data: {
          code: enrollment.certificate.code,
          isNew: false,
        },
      };
    }

    // Gera código único sem colisão
    let code = generateCertificateCode();
    let codeExists = await prisma.certificate.findUnique({ where: { code } });
    while (codeExists) {
      code = generateCertificateCode();
      codeExists = await prisma.certificate.findUnique({ where: { code } });
    }

    const issuedAt = new Date();
    const verificationHash = generateVerificationHash({
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      code,
      issuedAt,
    });

    // Criação em transação atômica
    const newCertificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          enrollmentId: enrollment.id,
          code,
          verificationHash,
          issuedAt,
        },
      });

      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "APPROVED",
        },
      });

      return cert;
    });

    revalidatePath("/cursista");
    revalidatePath(`/admin/cursos/${enrollment.courseId}`);
    revalidatePath(`/admin/cursos/${enrollment.courseId}/frequencia`);

    return {
      success: true,
      data: {
        code: newCertificate.code,
        isNew: true,
      },
    };
  } catch (err: unknown) {
    console.error("Erro ao emitir certificado:", err);
    const msg = err instanceof Error ? err.message : "Erro interno ao emitir certificado.";
    return { success: false, error: msg };
  }
}

/**
 * Emite certificados em lote para todos os cursistas homologados de um curso
 * que ainda não possuem certificado emitido. Ação exclusiva de ADMIN/INSTRUTOR.
 */
export async function issueBatchCertificatesAction(courseId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUTOR")) {
      return { success: false, error: "Acesso negado. Ação restrita à Secretaria e Formadores." };
    }

    const homologatedEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        homologatedAt: { not: null },
        certificate: null,
      },
      include: {
        user: true,
      },
    });

    if (homologatedEnrollments.length === 0) {
      return {
        success: true,
        data: {
          issuedCount: 0,
          message: "Nenhum cursista homologado pendente de certificação.",
        },
      };
    }

    let issuedCount = 0;
    const issuedAt = new Date();

    for (const enrollment of homologatedEnrollments) {
      let code = generateCertificateCode();
      let codeExists = await prisma.certificate.findUnique({ where: { code } });
      while (codeExists) {
        code = generateCertificateCode();
        codeExists = await prisma.certificate.findUnique({ where: { code } });
      }

      const verificationHash = generateVerificationHash({
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        code,
        issuedAt,
      });

      await prisma.$transaction([
        prisma.certificate.create({
          data: {
            enrollmentId: enrollment.id,
            code,
            verificationHash,
            issuedAt,
          },
        }),
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "APPROVED" },
        }),
      ]);

      issuedCount++;
    }

    revalidatePath(`/admin/cursos/${courseId}`);
    revalidatePath(`/admin/cursos/${courseId}/frequencia`);
    revalidatePath("/cursista");

    return {
      success: true,
      data: {
        issuedCount,
        message: `${issuedCount} certificados emitidos com sucesso!`,
      },
    };
  } catch (err: unknown) {
    console.error("Erro na emissão em lote de certificados:", err);
    const msg = err instanceof Error ? err.message : "Erro ao processar emissão em lote.";
    return { success: false, error: msg };
  }
}
