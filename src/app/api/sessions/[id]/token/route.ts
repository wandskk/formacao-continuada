import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        _count: { select: { attendances: true } },
        attendances: {
          take: 5,
          orderBy: { checkInAt: "desc" },
          include: {
            user: { select: { name: true, school: true } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    if (!session.isActive) {
      return NextResponse.json({
        isActive: false,
        qrToken: null,
        attendeesCount: session._count.attendances,
        recentAttendees: session.attendances.map((a) => ({
          name: a.user.name.split(" ")[0] + " " + (a.user.name.split(" ")[1] || ""),
          school: a.user.school,
          time: a.checkInAt,
        })),
      });
    }

    const now = Date.now();
    const expiresAt = session.qrExpiresAt ? new Date(session.qrExpiresAt).getTime() : 0;

    let currentToken = session.qrToken;
    let nextExpiresAt = session.qrExpiresAt;

    // Se o token expira nos próximos 3 segundos ou já expirou, renova no banco
    if (now >= expiresAt - 3000) {
      currentToken = crypto.randomUUID();
      nextExpiresAt = new Date(now + 25000); // 25s de vida

      await prisma.session.update({
        where: { id: session.id },
        data: {
          qrToken: currentToken,
          qrExpiresAt: nextExpiresAt,
        },
      });
    }

    return NextResponse.json({
      isActive: true,
      qrToken: currentToken,
      expiresAt: nextExpiresAt,
      attendeesCount: session._count.attendances,
      recentAttendees: session.attendances.map((a) => ({
        name: a.user.name.split(" ")[0] + " " + (a.user.name.split(" ")[1] || ""),
        school: a.user.school,
        time: a.checkInAt,
      })),
    });
  } catch (error) {
    console.error("Erro na rota de token dinâmico:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
