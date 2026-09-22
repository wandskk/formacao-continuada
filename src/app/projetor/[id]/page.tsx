import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrProjector } from "@/components/attendance/qr-projector";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProjetorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjetorPage({ params }: ProjetorPageProps) {
  const { id } = await params;

  let session = await prisma.session.findUnique({
    where: { id },
    include: {
      course: { select: { title: true } },
      _count: { select: { attendances: true } },
    },
  });

  if (!session) {
    notFound();
  }

  // Se a sessão está ativa mas o token expirou ou expira em menos de 10s,
  // renova imediatamente no banco ao abrir a projeção para garantir que o QR exibido é válido
  const now = Date.now();
  const expiresAt = session.qrExpiresAt ? new Date(session.qrExpiresAt).getTime() : 0;

  if (session.isActive && now >= expiresAt - 10000) {
    const freshToken = crypto.randomUUID();
    const freshExpiresAt = new Date(now + 300000); // 5 minutos

    session = await prisma.session.update({
      where: { id: session.id },
      data: {
        previousQrToken: session.qrToken,
        qrToken: freshToken,
        qrExpiresAt: freshExpiresAt,
      },
      include: {
        course: { select: { title: true } },
        _count: { select: { attendances: true } },
      },
    });
  }

  return (
    <QrProjector
      sessionId={session.id}
      initialToken={session.qrToken}
      courseTitle={session.course.title}
      sessionTitle={session.title}
      hours={session.hours}
      date={session.date}
      initialAttendeesCount={session._count.attendances}
    />
  );
}
