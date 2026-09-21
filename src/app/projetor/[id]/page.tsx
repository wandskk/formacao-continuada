import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrProjector } from "@/components/attendance/qr-projector";

interface ProjetorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjetorPage({ params }: ProjetorPageProps) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      course: { select: { title: true } },
      _count: { select: { attendances: true } },
    },
  });

  if (!session) {
    notFound();
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
