import { prisma } from "@/lib/prisma";

/**
 * Converte uma string (ex: título do curso) em um slug amigável para URLs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres inválidos
    .replace(/[\s_]+/g, "-") // Substitui espaços e underscores por hífen
    .replace(/-+/g, "-") // Remove hifens consecutivos
    .replace(/^-+|-+$/g, ""); // Remove hifens no início e fim
}

/**
 * Gera um slug único garantido para o curso, consultando o banco Neon
 */
export async function generateUniqueCourseSlug(
  title: string,
  excludeCourseId?: string
): Promise<string> {
  const baseSlug = slugify(title) || "curso";
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.course.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });

    if (!existing || (excludeCourseId && existing.id === excludeCourseId)) {
      return uniqueSlug;
    }

    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
