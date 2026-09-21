import { getSession } from "./session";
import { prisma } from "@/lib/prisma";

/**
 * Obtém os dados completos do usuário autenticado no banco a partir da sessão
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        role: true,
        school: true,
        function: true,
        phone: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
