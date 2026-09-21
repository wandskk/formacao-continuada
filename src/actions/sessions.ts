"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { CheckInType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export type ActionResponse<T = any> = {
  success?: boolean;
  error?: string;
  data?: T;
};

const sessionSchema = z.object({
  title: z.string().optional(),
  date: z.string().min(1, "Data do encontro é obrigatória"),
  hours: z.coerce.number().int().positive("A carga horária deve ser maior que zero"),
  instructorId: z.string().optional(),
});

/**
 * Criação de uma nova sessão de formação / encontro
 */
export async function createSessionAction(
  courseId: string,
  _prevState: any,
  formData: FormData
): Promise<ActionResponse<{ id: string }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUTOR")) {
    return { error: "Acesso não autorizado." };
  }

  const rawData = {
    title: formData.get("title") as string,
    date: formData.get("date") as string,
    hours: formData.get("hours"),
    instructorId: (formData.get("instructorId") as string) || (currentUser.role === "INSTRUTOR" ? currentUser.id : undefined),
  };

  const validation = sessionSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Dados inválidos." };
  }

  const { title, date: dateStr, hours, instructorId } = validation.data;

  try {
    const session = await prisma.session.create({
      data: {
        courseId,
        title: title || `Encontro Presencial (${hours}h)`,
        date: new Date(dateStr),
        hours,
        instructorId: instructorId || currentUser.id,
        qrToken: crypto.randomUUID(),
        qrExpiresAt: new Date(Date.now() + 30000), // 30s inicial
        isActive: true,
      },
    });

    revalidatePath(`/admin/cursos/${courseId}`);
    revalidatePath("/instrutor");
    return { success: true, data: { id: session.id } };
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return { error: "Falha ao criar o encontro no banco de dados." };
  }
}

/**
 * Ativa ou encerra a chamada de uma sessão
 */
export async function toggleSessionStatusAction(sessionId: string): Promise<ActionResponse<{ isActive: boolean }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUTOR")) {
    return { error: "Acesso não autorizado." };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { error: "Sessão não encontrada." };
    }

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: !session.isActive },
    });

    revalidatePath(`/instrutor/sessao/${sessionId}`);
    revalidatePath(`/projetor/${sessionId}`);
    return { success: true, data: { isActive: updated.isActive } };
  } catch (error) {
    console.error("Erro ao alterar status da sessão:", error);
    return { error: "Erro ao atualizar chamada." };
  }
}

/**
 * Rotaciona o token dinâmico da chamada (chamado pela tela do projetor a cada 20s)
 */
export async function rotateSessionQrTokenAction(sessionId: string): Promise<ActionResponse<{ qrToken: string; expiresAt: Date }>> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, isActive: true },
    });

    if (!session || !session.isActive) {
      return { error: "Sessão inativa ou não encontrada." };
    }

    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 25000); // 25s de validade

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        qrToken: newToken,
        qrExpiresAt: expiresAt,
      },
    });

    return { success: true, data: { qrToken: newToken, expiresAt } };
  } catch (error) {
    console.error("Erro ao rotacionar token QR:", error);
    return { error: "Erro ao gerar novo token de presença." };
  }
}

/**
 * Registro de check-in dinâmico por QR Code (Mobile Cursista)
 */
export async function checkInAction({
  sessionId,
  qrToken,
}: {
  sessionId: string;
  qrToken: string;
}): Promise<
  ActionResponse<{
    courseTitle: string;
    sessionTitle: string | null;
    hours: number;
    checkInAt: Date;
  }>
> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você precisa estar autenticado com seu CPF para registrar presença." };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    if (!session) {
      return { error: "Sessão de chamada não encontrada." };
    }

    if (!session.isActive) {
      return { error: "Esta chamada foi encerrada pelo formador." };
    }

    // Validação do Token dinâmico com tolerância de 15 segundos para latência 3G/4G
    const now = Date.now();
    const expiryTime = session.qrExpiresAt ? new Date(session.qrExpiresAt).getTime() : 0;
    const isTokenMatch = session.qrToken === qrToken;
    const isWithinGraceWindow = now <= expiryTime + 15000;

    if (!isTokenMatch || !isWithinGraceWindow) {
      return {
        error: "Código QR expirado ou inválido. Por favor, aponte a câmera novamente para o telão.",
      };
    }

    // Verifica se o cursista está matriculado no curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: session.course.id,
        },
      },
    });

    if (!enrollment) {
      return {
        error: "Você não está matriculado nesta formação. Solicite a inclusão à coordenação ou use o link de inscrição.",
      };
    }

    // Verifica duplicidade de presença
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: currentUser.id,
        },
      },
    });

    if (existingAttendance) {
      return {
        error: "Sua presença nesta sessão já foi confirmada anteriormente!",
      };
    }

    // Registra a presença com sucesso
    const attendance = await prisma.attendance.create({
      data: {
        sessionId: session.id,
        userId: currentUser.id,
        method: CheckInType.QR_CODE,
      },
    });

    revalidatePath(`/cursista`);
    revalidatePath(`/instrutor/sessao/${sessionId}`);
    revalidatePath(`/projetor/${sessionId}`);

    return {
      success: true,
      data: {
        courseTitle: session.course.title,
        sessionTitle: session.title,
        hours: session.hours,
        checkInAt: attendance.checkInAt,
      },
    };
  } catch (error) {
    console.error("Erro no check-in:", error);
    return { error: "Erro interno ao processar a presença." };
  }
}

/**
 * Baixa manual de presença de contingência (Exclusivo INSTRUTOR / ADMIN)
 */
export async function manualCheckInAction({
  sessionId,
  userId,
  justification,
}: {
  sessionId: string;
  userId: string;
  justification?: string;
}): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUTOR")) {
    return { error: "Acesso não autorizado." };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!session) {
      return { error: "Sessão não encontrada." };
    }

    // Verifica se o usuário já tem presença
    const existing = await prisma.attendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existing) {
      return { error: "Este cursista já possui presença registrada nesta sessão." };
    }

    await prisma.attendance.create({
      data: {
        sessionId,
        userId,
        method: CheckInType.MANUAL,
        manualRegisteredBy: currentUser.id,
        justification: justification || "Baixa manual de contingência (sem smartphone / conectividade)",
      },
    });

    revalidatePath(`/instrutor/sessao/${sessionId}`);
    revalidatePath(`/projetor/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro na baixa manual:", error);
    return { error: "Erro ao registrar baixa manual." };
  }
}

/**
 * Remoção de presença (em caso de engano do formador)
 */
export async function removeAttendanceAction(attendanceId: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUTOR")) {
    return { error: "Acesso não autorizado." };
  }

  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      return { error: "Registro de presença não encontrado." };
    }

    await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    revalidatePath(`/instrutor/sessao/${attendance.sessionId}`);
    revalidatePath(`/projetor/${attendance.sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover presença:", error);
    return { error: "Erro ao estornar presença." };
  }
}
