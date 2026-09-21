import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Executa uma query simples para validar a conexão ativa com o banco PostgreSQL
    await prisma.$queryRaw`SELECT 1 as connected`;

    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();

    return NextResponse.json({
      status: "online",
      database: "connected (Neon PostgreSQL)",
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount,
        courses: courseCount,
      },
    });
  } catch (error: any) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error?.message || "Unknown database error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
