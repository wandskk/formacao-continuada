import { prisma } from "@/lib/prisma";
import { EnrollmentStatus, CheckInType } from "@prisma/client";

export interface CursistaFrequencyRecord {
  enrollmentId: string;
  userId: string;
  name: string;
  cpf: string;
  school?: string | null;
  function?: string | null;
  email?: string | null;
  phone?: string | null;
  enrolledAt: Date;
  homologatedAt?: Date | null;
  homologatedBy?: string | null;
  status: EnrollmentStatus;
  hasCertificate: boolean;
  certificateCode?: string | null;
  completedHours: number;
  frequencyPercentage: number;
  taughtFrequencyPercentage: number;
  isApproved: boolean;
  isHomologated: boolean;
  attendedSessions: {
    sessionId: string;
    sessionTitle?: string | null;
    date: Date;
    hours: number;
    method: CheckInType;
    checkInAt: Date;
  }[];
}

export interface CourseFrequencyReport {
  course: {
    id: string;
    title: string;
    slug: string;
    totalHours: number;
    minFrequency: number;
    status: string;
    startDate?: Date | null;
    endDate?: Date | null;
    targetAudience?: string | null;
  };
  sessions: {
    id: string;
    title?: string | null;
    date: Date;
    hours: number;
    isActive: boolean;
  }[];
  totalTaughtHours: number;
  cursistas: CursistaFrequencyRecord[];
  metrics: {
    totalEnrolled: number;
    totalSessions: number;
    approvedCount: number;
    reprovedCount: number;
    homologatedCount: number;
    approvalRate: number;
    averageFrequency: number;
  };
}

/**
 * Motor central de cálculo e apuração de frequência e cumprimento de carga horária para o MEC
 */
export async function calculateCourseFrequencyData(courseId: string): Promise<CourseFrequencyReport | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sessions: {
        orderBy: { date: "asc" },
      },
      enrollments: {
        include: {
          user: true,
          certificate: true,
        },
        orderBy: { enrolledAt: "asc" },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Busca todas as presenças das sessões deste curso
  const sessionIds = course.sessions.map((s) => s.id);
  const attendances = await prisma.attendance.findMany({
    where: {
      sessionId: { in: sessionIds },
    },
    include: {
      session: true,
    },
  });

  // Mapeia presenças por userId -> sessionId -> Attendance
  const userAttendancesMap = new Map<string, typeof attendances>();
  for (const att of attendances) {
    const list = userAttendancesMap.get(att.userId) || [];
    list.push(att);
    userAttendancesMap.set(att.userId, list);
  }

  const totalTaughtHours = course.sessions.reduce((acc, s) => acc + s.hours, 0);

  let approvedCount = 0;
  let homologatedCount = 0;
  let sumFrequency = 0;

  const cursistas: CursistaFrequencyRecord[] = course.enrollments.map((enr) => {
    const userAtts = userAttendancesMap.get(enr.userId) || [];

    const attendedSessions = userAtts.map((att) => ({
      sessionId: att.sessionId,
      sessionTitle: att.session.title,
      date: att.session.date,
      hours: att.session.hours,
      method: att.method,
      checkInAt: att.checkInAt,
    }));

    const completedHours = attendedSessions.reduce((acc, s) => acc + s.hours, 0);

    // Frequência frente à carga horária total oficial do curso (ex: 40h)
    const frequencyPercentage = course.totalHours > 0
      ? Math.min(100, Math.round((completedHours / course.totalHours) * 100))
      : 0;

    // Frequência frente às horas ministradas até o momento
    const taughtFrequencyPercentage = totalTaughtHours > 0
      ? Math.min(100, Math.round((completedHours / totalTaughtHours) * 100))
      : 0;

    const isApproved = frequencyPercentage >= course.minFrequency;
    const isHomologated = !!enr.homologatedAt;

    if (isApproved) approvedCount++;
    if (isHomologated) homologatedCount++;
    sumFrequency += frequencyPercentage;

    return {
      enrollmentId: enr.id,
      userId: enr.user.id,
      name: enr.user.name,
      cpf: enr.user.cpf,
      school: enr.user.school,
      function: enr.user.function,
      email: enr.user.email,
      phone: enr.user.phone,
      enrolledAt: enr.enrolledAt,
      homologatedAt: enr.homologatedAt,
      homologatedBy: enr.homologatedBy,
      status: enr.status,
      hasCertificate: !!enr.certificate,
      certificateCode: enr.certificate?.code || null,
      completedHours,
      frequencyPercentage,
      taughtFrequencyPercentage,
      isApproved,
      isHomologated,
      attendedSessions,
    };
  });

  const totalEnrolled = cursistas.length;
  const reprovedCount = Math.max(0, totalEnrolled - approvedCount);
  const approvalRate = totalEnrolled > 0 ? Math.round((approvedCount / totalEnrolled) * 100) : 0;
  const averageFrequency = totalEnrolled > 0 ? Math.round(sumFrequency / totalEnrolled) : 0;

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      totalHours: course.totalHours,
      minFrequency: course.minFrequency,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
      targetAudience: course.targetAudience,
    },
    sessions: course.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      hours: s.hours,
      isActive: s.isActive,
    })),
    totalTaughtHours,
    cursistas,
    metrics: {
      totalEnrolled,
      totalSessions: course.sessions.length,
      approvedCount,
      reprovedCount,
      homologatedCount,
      approvalRate,
      averageFrequency,
    },
  };
}
