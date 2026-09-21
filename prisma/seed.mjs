import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados Neon...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const instructorHash = await bcrypt.hash("instrutor123", 10);
  const cursistaHash = await bcrypt.hash("12051988", 10);
  const wandersonHash = await bcrypt.hash("11011997", 10);

  // 1. Usuário Admin Principal (Wanderson Kenedy)
  await prisma.user.upsert({
    where: { cpf: "12167857403" },
    update: {
      name: "Wanderson Kenedy Soares de Oliveira",
      role: "ADMIN",
      password: wandersonHash,
      birthDate: new Date("1997-01-11T00:00:00.000Z"),
      school: "Secretaria Municipal de Educação",
      function: "Administrador do Sistema",
    },
    create: {
      name: "Wanderson Kenedy Soares de Oliveira",
      cpf: "12167857403",
      email: "wanderson.oliveira@educacao.gov.br",
      password: wandersonHash,
      role: "ADMIN",
      birthDate: new Date("1997-01-11T00:00:00.000Z"),
      school: "Secretaria Municipal de Educação",
      function: "Administrador do Sistema",
    },
  });

  // 1.1. Usuário Admin de Demonstração
  const admin = await prisma.user.upsert({
    where: { cpf: "00000000001" },
    update: {},
    create: {
      name: "Coordenador Geral (Secretaria)",
      cpf: "00000000001",
      email: "admin@educacao.gov.br",
      password: adminHash,
      role: "ADMIN",
      school: "Secretaria Municipal de Educação",
      function: "Gestor do Selo Alfabetização",
    },
  });

  // 2. Usuário Instrutor (Formador)
  const instructor = await prisma.user.upsert({
    where: { cpf: "00000000002" },
    update: {},
    create: {
      name: "Prof. Formador Carlos Eduardo",
      cpf: "00000000002",
      email: "carlos.formador@educacao.gov.br",
      password: instructorHash,
      role: "INSTRUTOR",
      school: "Centro de Formação de Professores",
      function: "Formador do Ciclo de Alfabetização",
    },
  });

  // 3. Usuário Cursista (Professor da Rede)
  const cursista = await prisma.user.upsert({
    where: { cpf: "00000000003" },
    update: {},
    create: {
      name: "Profª Maria Silveira",
      cpf: "00000000003",
      email: "maria.prof@escola.gov.br",
      password: cursistaHash,
      role: "CURSISTA",
      birthDate: new Date("1988-05-12T00:00:00.000Z"),
      school: "E.M. Monteiro Lobato",
      function: "Professora do 1º Ano EF",
    },
  });

  // 4. Curso de Exemplo (Selo Alfabetização MEC)
  const course = await prisma.course.upsert({
    where: { slug: "alfabetizacao-na-idade-certa-2026" },
    update: {},
    create: {
      title: "Práticas Pedagógicas para Alfabetização na Idade Certa",
      slug: "alfabetizacao-na-idade-certa-2026",
      description: "Formação intensiva em consciência fonológica, letramento e métodos lúdicos de alfabetização para atendimento às metas do Edital nº 7/2026 (Selo MEC).",
      targetAudience: "Professores do 1º e 2º ano do Ensino Fundamental",
      syllabus: "Módulo I: Consciência Fonológica e Fonêmica. Módulo II: Princípio Alfabético e Ortografia. Módulo III: Fluência e Compreensão Leitora. Módulo IV: Avaliação Formativa da Alfabetização.",
      totalHours: 40,
      minFrequency: 75.0,
      status: "OPEN",
    },
  });

  // 5. Matrícula de demonstração
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: cursista.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: cursista.id,
      courseId: course.id,
      status: "IN_PROGRESS",
    },
  });

  console.log("Seed concluído com sucesso!");
  console.log("Contas de teste criadas:");
  console.log("- ADMIN (Wanderson): CPF 121.678.574-03 / Senha 11011997");
  console.log("- ADMIN (Demo):      CPF 000.000.000-01 / Senha admin123");
  console.log("- INSTRUTOR:         CPF 000.000.000-02 / Senha instrutor123");
  console.log("- CURSISTA:          CPF 000.000.000-03 / Senha 12051988 (Data de Nasc: 12/05/1988)");
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
