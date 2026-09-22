"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { generateUniqueCourseSlug, slugify } from "@/lib/slug";
import { sanitizeNumeric } from "@/lib/utils";
import { formatBirthDatePassword, hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { parseCursistasSpreadsheet } from "@/lib/spreadsheet";
import { CourseStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const courseSchema = z.object({
  title: z.string().min(3, "O título da formação deve ter no mínimo 3 caracteres"),
  slug: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  syllabus: z.string().optional(),
  totalHours: z.coerce.number().int().positive("A carga horária deve ser maior que zero"),
  minFrequency: z.coerce
    .number()
    .min(0, "Frequência mínima não pode ser negativa")
    .max(100, "Frequência máxima é 100%")
    .default(75),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.OPEN),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  organizer: z.string().optional(),
  partner: z.string().optional(),
  enrollmentNotice: z.string().optional(),
  roleOptions: z.string().optional(),
  schoolOptions: z.string().optional(),
  trackOptions: z.string().optional(),
  requirePhone: z.preprocess(
    (val) => val === "true" || val === "on" || val === true || val === "1",
    z.boolean()
  ).default(true),
});

export type ActionResponse<T = any> = {
  success?: boolean;
  error?: string;
  data?: T;
};

/**
 * Criação de nova formação continuada (Exclusivo ADMIN)
 */
export async function createCourseAction(
  _prevState: any,
  formData: FormData
): Promise<ActionResponse<{ id: string; slug: string }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado. Apenas administradores podem criar formações." };
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    targetAudience: formData.get("targetAudience") as string,
    syllabus: formData.get("syllabus") as string,
    totalHours: formData.get("totalHours"),
    minFrequency: formData.get("minFrequency") || "75",
    status: (formData.get("status") as CourseStatus) || CourseStatus.OPEN,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    organizer: formData.get("organizer") as string,
    partner: formData.get("partner") as string,
    enrollmentNotice: formData.get("enrollmentNotice") as string,
    roleOptions: formData.get("roleOptions") as string,
    schoolOptions: formData.get("schoolOptions") as string,
    trackOptions: formData.get("trackOptions") as string,
    requirePhone: formData.get("requirePhone") !== null ? formData.get("requirePhone") : "true",
  };

  const validation = courseSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Dados inválidos." };
  }

  const {
    title,
    slug: customSlug,
    description,
    targetAudience,
    syllabus,
    totalHours,
    minFrequency,
    status,
    startDate,
    endDate,
    organizer,
    partner,
    enrollmentNotice,
    roleOptions,
    schoolOptions,
    trackOptions,
    requirePhone,
  } = validation.data;

  try {
    let finalSlug: string;
    if (customSlug && customSlug.trim().length > 0) {
      finalSlug = await generateUniqueCourseSlug(customSlug);
    } else {
      finalSlug = await generateUniqueCourseSlug(title);
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug: finalSlug,
        description: description || null,
        targetAudience: targetAudience || null,
        syllabus: syllabus || null,
        totalHours,
        minFrequency,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        organizer: organizer || null,
        partner: partner || null,
        enrollmentNotice: enrollmentNotice || null,
        roleOptions: roleOptions || null,
        schoolOptions: schoolOptions || null,
        trackOptions: trackOptions || null,
        requirePhone,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cursos");
    return { success: true, data: { id: course.id, slug: course.slug } };
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    return { error: "Erro ao cadastrar a formação no banco de dados." };
  }
}

/**
 * Atualização de formação continuada (Exclusivo ADMIN)
 */
export async function updateCourseAction(
  courseId: string,
  _prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado." };
  }

  const rawData = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    targetAudience: formData.get("targetAudience") as string,
    syllabus: formData.get("syllabus") as string,
    totalHours: formData.get("totalHours"),
    minFrequency: formData.get("minFrequency") || "75",
    status: (formData.get("status") as CourseStatus) || CourseStatus.OPEN,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    organizer: formData.get("organizer") as string,
    partner: formData.get("partner") as string,
    enrollmentNotice: formData.get("enrollmentNotice") as string,
    roleOptions: formData.get("roleOptions") as string,
    schoolOptions: formData.get("schoolOptions") as string,
    trackOptions: formData.get("trackOptions") as string,
    requirePhone: formData.get("requirePhone") !== null ? formData.get("requirePhone") : "false",
  };

  const validation = courseSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Dados inválidos." };
  }

  const {
    title,
    slug: customSlug,
    description,
    targetAudience,
    syllabus,
    totalHours,
    minFrequency,
    status,
    startDate,
    endDate,
    organizer,
    partner,
    enrollmentNotice,
    roleOptions,
    schoolOptions,
    trackOptions,
    requirePhone,
  } = validation.data;

  try {
    let finalSlug: string | undefined = undefined;
    if (customSlug && customSlug.trim().length > 0) {
      finalSlug = await generateUniqueCourseSlug(customSlug, courseId);
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        ...(finalSlug ? { slug: finalSlug } : {}),
        description: description || null,
        targetAudience: targetAudience || null,
        syllabus: syllabus || null,
        totalHours,
        minFrequency,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        organizer: organizer || null,
        partner: partner || null,
        enrollmentNotice: enrollmentNotice || null,
        roleOptions: roleOptions || null,
        schoolOptions: schoolOptions || null,
        trackOptions: trackOptions || null,
        requirePhone,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cursos");
    revalidatePath(`/admin/cursos/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return { error: "Erro ao atualizar os dados da formação." };
  }
}

/**
 * Exclusão de formação continuada (Exclusivo ADMIN)
 */
export async function deleteCourseAction(courseId: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado." };
  }

  try {
    // Verifica se já possui presenças ou certificados emitidos
    const courseWithData = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sessions: {
          include: {
            _count: { select: { attendances: true } },
          },
        },
        enrollments: {
          include: {
            certificate: true,
          },
        },
      },
    });

    if (!courseWithData) {
      return { error: "Formação não encontrada." };
    }

    const hasCertificates = courseWithData.enrollments.some((e) => e.certificate !== null);
    const hasAttendances = courseWithData.sessions.some((s) => s._count.attendances > 0);

    if (hasCertificates || hasAttendances) {
      // Para integridade histórica do MEC, arquiva ao invés de deletar
      await prisma.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.ARCHIVED },
      });
      revalidatePath("/admin/cursos");
      return {
        success: true,
        data: { message: "O curso possui histórico de presença/certificação e foi arquivado por conformidade." },
      };
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cursos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return { error: "Erro interno ao tentar remover a formação." };
  }
}

const publicEnrollSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .transform((val) => sanitizeNumeric(val))
    .refine((val) => val.length === 11, "O CPF deve conter 11 dígitos"),
  birthDate: z.string().min(8, "Data de nascimento é obrigatória"),
  school: z.string().optional(),
  function: z.string().optional(),
  track: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

/**
 * Auto-inscrição de cursista pela página pública do curso (/inscricao/[slug])
 */
export async function publicEnrollAction(
  courseSlug: string,
  _prevState: any,
  formData: FormData
): Promise<ActionResponse<{ courseTitle: string }>> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  });

  if (!course) {
    return { error: "Formação não encontrada ou link expirado." };
  }

  if (course.status !== CourseStatus.OPEN) {
    return { error: "As inscrições para esta formação não estão abertas no momento." };
  }

  const rawPhone = (formData.get("phone") as string) || "";
  if (course.requirePhone && sanitizeNumeric(rawPhone).length < 10) {
    return { error: "O número de telefone / WhatsApp com DDD é obrigatório para esta formação." };
  }

  const rawData = {
    name: formData.get("name") as string,
    cpf: formData.get("cpf") as string,
    birthDate: formData.get("birthDate") as string,
    school: formData.get("school") as string,
    function: formData.get("function") as string,
    track: formData.get("track") as string,
    email: formData.get("email") as string,
    phone: rawPhone,
  };

  const validation = publicEnrollSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Dados inválidos." };
  }

  const { name, cpf, birthDate: birthStr, school, function: userFunction, track, email, phone } = validation.data;
  const parsedBirth = new Date(birthStr);

  try {
    let user = await prisma.user.findUnique({
      where: { cpf },
    });

    if (!user) {
      // Criação de cursista com senha padrão baseada na data de nascimento (DEC-003)
      const defaultPassword = formatBirthDatePassword(parsedBirth);
      const hashedPassword = await hashPassword(defaultPassword);

      user = await prisma.user.create({
        data: {
          name,
          cpf,
          birthDate: parsedBirth,
          password: hashedPassword,
          role: Role.CURSISTA,
          school: school || null,
          function: userFunction || null,
          email: email ? email.toLowerCase() : null,
          phone: phone || null,
        },
      });
    } else {
      // Se usuário já existe, atualiza dados cadastrais
      await prisma.user.update({
        where: { id: user.id },
        data: {
          school: school || user.school || null,
          function: userFunction || user.function || null,
          phone: phone || user.phone || null,
          ...(user.email ? {} : email ? { email: email.toLowerCase() } : {}),
        },
      });
    }

    // Verifica se já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return {
        error: "Você já está matriculado nesta formação! Faça login com seu CPF para acessar suas presenças.",
      };
    }

    // Efetiva a matrícula vinculando dados do snapshot da inscrição
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        school: school || null,
        function: userFunction || null,
        track: track || null,
      },
    });

    // Inicia a sessão automática no cookie
    await setSessionCookie({
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      email: user.email,
    });

    revalidatePath("/cursista");
    revalidatePath(`/admin/cursos/${course.id}`);

    return { success: true, data: { courseTitle: course.title } };
  } catch (error) {
    console.error("Erro na auto-inscrição pública:", error);
    return { error: "Erro ao processar inscrição. Verifique os dados e tente novamente." };
  }
}

/**
 * Inscrição com 1 clique para usuário já autenticado
 */
export async function authenticatedEnrollAction(
  courseId: string,
  metadata?: { school?: string; function?: string; track?: string }
): Promise<ActionResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você precisa estar logado para se inscrever." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.status !== CourseStatus.OPEN) {
    return { error: "Formação não disponível para inscrição no momento." };
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { error: "Você já está matriculado nesta formação." };
    }

    await prisma.enrollment.create({
      data: {
        userId: currentUser.id,
        courseId,
        school: metadata?.school || currentUser.school || null,
        function: metadata?.function || currentUser.function || null,
        track: metadata?.track || null,
      },
    });

    revalidatePath("/cursista");
    revalidatePath(`/admin/cursos/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao matricular usuário logado:", error);
    return { error: "Erro ao efetivar matrícula." };
  }
}

/**
 * Importação em Lote de Cursistas via Planilha (Exclusivo ADMIN)
 */
export async function importCursistasAction(
  courseId: string,
  formData: FormData
): Promise<
  ActionResponse<{
    totalProcessed: number;
    newUsersCreated: number;
    enrollmentsCreated: number;
    alreadyEnrolled: number;
    errors: { row: number; reason: string }[];
  }>
> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Acesso não autorizado." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return { error: "Formação não encontrada." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Por favor, selecione um arquivo de planilha (.xlsx ou .csv)." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parseResult = parseCursistasSpreadsheet(buffer);
    if (parseResult.validRows.length === 0 && parseResult.errors.length > 0) {
      return {
        error: `A planilha não contém linhas válidas. Primeiro erro: ${parseResult.errors[0].reason}`,
        data: {
          totalProcessed: parseResult.totalRows,
          newUsersCreated: 0,
          enrollmentsCreated: 0,
          alreadyEnrolled: 0,
          errors: parseResult.errors.map((e) => ({ row: e.row, reason: e.reason })),
        },
      };
    }

    let newUsersCreated = 0;
    let enrollmentsCreated = 0;
    let alreadyEnrolled = 0;
    const processingErrors = [...parseResult.errors.map((e) => ({ row: e.row, reason: e.reason }))];

    for (const row of parseResult.validRows) {
      try {
        let user = await prisma.user.findUnique({
          where: { cpf: row.cpf },
        });

        if (!user) {
          const defaultPassword = formatBirthDatePassword(row.birthDate);
          const hashedPassword = await hashPassword(defaultPassword);

          user = await prisma.user.create({
            data: {
              name: row.name,
              cpf: row.cpf,
              birthDate: row.birthDate,
              password: hashedPassword,
              role: Role.CURSISTA,
              school: row.school || null,
              function: row.function || null,
              email: row.email || null,
              phone: row.phone || null,
            },
          });
          newUsersCreated++;
        } else {
          // Atualiza dados cadastrais se aplicável
          await prisma.user.update({
            where: { id: user.id },
            data: {
              school: row.school || user.school,
              function: row.function || user.function,
              phone: row.phone || user.phone,
              email: row.email || user.email,
            },
          });
        }

        // Verifica matrícula na turma
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId,
            },
          },
        });

        if (existingEnrollment) {
          alreadyEnrolled++;
        } else {
          await prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId,
            },
          });
          enrollmentsCreated++;
        }
      } catch (rowError: any) {
        console.error(`Erro ao processar linha do cursista CPF ${row.cpf}:`, rowError);
        processingErrors.push({
          row: 0,
          reason: `Erro no cursista ${row.name} (${row.cpf}): ${rowError.message || "Falha ao gravar"}`,
        });
      }
    }

    revalidatePath(`/admin/cursos/${courseId}`);
    revalidatePath("/admin/cursos");
    revalidatePath("/admin");

    return {
      success: true,
      data: {
        totalProcessed: parseResult.totalRows,
        newUsersCreated,
        enrollmentsCreated,
        alreadyEnrolled,
        errors: processingErrors,
      },
    };
  } catch (error) {
    console.error("Erro no processamento da planilha:", error);
    return { error: "Falha ao ler o arquivo de planilha. Certifique-se de que é um arquivo válido." };
  }
}

/**
 * Remoção / Desmatrícula de cursista (Exclusivo ADMIN)
 */
export async function removeEnrollmentAction(enrollmentId: string): Promise<ActionResponse> {
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
      return { error: "Não é possível desmatricular um cursista com certificado já emitido." };
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    revalidatePath(`/admin/cursos/${enrollment.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover matrícula:", error);
    return { error: "Erro ao desmatricular cursista." };
  }
}
