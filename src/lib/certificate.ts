import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";
import { formatCPF, maskCPF } from "@/lib/utils";

/**
 * Gera um código legível único para o certificado.
 * Exemplo: CERT-2026-X8K9M2
 */
export function generateCertificateCode(year: number = new Date().getFullYear()): string {
  // Caracteres alfanuméricos sem ambiguidade (removidos 0, O, 1, I, L)
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    randomPart += chars[randomIndex];
  }
  return `CERT-${year}-${randomPart}`;
}

/**
 * Gera o hash criptográfico SHA-256 para comprovação matemática de autenticidade.
 */
export function generateVerificationHash(params: {
  enrollmentId: string;
  userId: string;
  courseId: string;
  code: string;
  issuedAt: Date;
}): string {
  const secretSalt = process.env.CERTIFICATE_SECRET || "MEC-EDITAL-7-2026-SELO-ALFABETIZACAO";
  const payload = [
    params.enrollmentId,
    params.userId,
    params.courseId,
    params.code,
    params.issuedAt.toISOString(),
    secretSalt,
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Gera um Data URL (imagem base64) de QR Code para validação pública do certificado.
 */
export async function generateValidationQRCode(code: string, origin?: string): Promise<string> {
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const validationUrl = `${baseUrl}/validar/${encodeURIComponent(code)}`;

  return await QRCode.toDataURL(validationUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 256,
    color: {
      dark: "#0F172A", // Slate 900
      light: "#FFFFFF",
    },
  });
}

export interface CertificateDetails {
  id: string;
  code: string;
  verificationHash: string;
  issuedAt: Date;
  pdfUrl?: string | null;
  cursista: {
    id: string;
    name: string;
    cpf: string;
    cpfFormatted: string;
    cpfMasked: string;
    email?: string | null;
    school?: string | null;
    function?: string | null;
  };
  course: {
    id: string;
    title: string;
    description?: string | null;
    syllabus?: string | null;
    totalHours: number;
    minFrequency: number;
    startDate?: Date | null;
    endDate?: Date | null;
    targetAudience?: string | null;
  };
  homologation: {
    homologatedAt?: Date | null;
    homologatedBy?: string | null;
  };
  metrics: {
    completedHours: number;
    frequencyPercentage: number;
    attendedSessionsCount: number;
    totalSessionsCount: number;
  };
  sessions: {
    id: string;
    title?: string | null;
    date: Date;
    hours: number;
  }[];
  qrCodeDataUrl: string;
  validationUrl: string;
}

/**
 * Busca todos os detalhes necessários para emissão, impressão e validação pública de um certificado pelo código.
 */
export async function getCertificateDetailsByCode(
  code: string,
  origin?: string
): Promise<CertificateDetails | null> {
  const certificate = await prisma.certificate.findUnique({
    where: { code },
    include: {
      enrollment: {
        include: {
          user: true,
          course: {
            include: {
              sessions: {
                orderBy: { date: "asc" },
                include: {
                  attendances: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!certificate || !certificate.enrollment) {
    return null;
  }

  const { enrollment } = certificate;
  const { user, course } = enrollment;

  // Calcula presenças do cursista
  const attendedSessions = course.sessions.filter((session) =>
    session.attendances.some((att) => att.userId === user.id)
  );

  const completedHours = attendedSessions.reduce((acc, s) => acc + s.hours, 0);
  const frequencyPercentage =
    course.totalHours > 0
      ? Math.min(100, Math.round((completedHours / course.totalHours) * 100))
      : 0;

  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const validationUrl = `${baseUrl}/validar/${encodeURIComponent(code)}`;
  const qrCodeDataUrl = await generateValidationQRCode(code, origin);

  return {
    id: certificate.id,
    code: certificate.code,
    verificationHash: certificate.verificationHash,
    issuedAt: certificate.issuedAt,
    pdfUrl: certificate.pdfUrl,
    cursista: {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      cpfFormatted: formatCPF(user.cpf),
      cpfMasked: maskCPF(user.cpf),
      email: user.email,
      school: user.school,
      function: user.function,
    },
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      syllabus: course.syllabus,
      totalHours: course.totalHours,
      minFrequency: course.minFrequency,
      startDate: course.startDate,
      endDate: course.endDate,
      targetAudience: course.targetAudience,
    },
    homologation: {
      homologatedAt: enrollment.homologatedAt,
      homologatedBy: enrollment.homologatedBy,
    },
    metrics: {
      completedHours,
      frequencyPercentage,
      attendedSessionsCount: attendedSessions.length,
      totalSessionsCount: course.sessions.length,
    },
    sessions: course.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      hours: s.hours,
    })),
    qrCodeDataUrl,
    validationUrl,
  };
}
