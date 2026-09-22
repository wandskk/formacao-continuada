import { NextResponse } from "next/server";
import { calculateCourseFrequencyData } from "@/lib/frequency";
import * as XLSX from "xlsx";
import { formatCPF } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const report = await calculateCourseFrequencyData(id);

    if (!report) {
      return new NextResponse("Formação não encontrada", { status: 404 });
    }

    const { course, cursistas } = report;

    // Constrói os dados tabulares formatados para o MEC
    const rows = cursistas.map((c, index) => ({
      "Nº": index + 1,
      "Nome do Professor Cursista": c.name,
      "CPF": formatCPF(c.cpf),
      "Escola de Lotação": c.school || "Não informada",
      "Cargo / Função": c.function || "Professor",
      "Trilha / Segmento": c.track || "Padrão / Geral",
      "Horas Cumpridas": c.completedHours,
      "Carga Horária do Curso": course.totalHours,
      "Frequência (%)": `${c.frequencyPercentage}%`,
      "Freq. Mínima Exigida": `${course.minFrequency}%`,
      "Situação Edital MEC": c.isApproved ? "APTO PARA CERTIFICAÇÃO" : "FREQUÊNCIA INSUFICIENTE",
      "Homologado Secretaria": c.isHomologated ? "HOMOLOGADO" : "PENDENTE",
      "E-mail": c.email || "",
      "Telefone": c.phone || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frequência MEC");

    // Ajusta a largura das colunas
    worksheet["!cols"] = [
      { wch: 6 },  // Nº
      { wch: 32 }, // Nome
      { wch: 18 }, // CPF
      { wch: 28 }, // Escola
      { wch: 22 }, // Cargo
      { wch: 24 }, // Trilha
      { wch: 16 }, // Horas Cumpridas
      { wch: 22 }, // Carga Horária
      { wch: 16 }, // Frequência %
      { wch: 22 }, // Freq Minima
      { wch: 28 }, // Situação Edital MEC
      { wch: 22 }, // Homologado
      { wch: 26 }, // Email
      { wch: 18 }, // Telefone
    ];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const safeFilename = `relatorio-mec-${course.slug || "curso"}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar planilha Excel do MEC:", error);
    return new NextResponse("Erro ao gerar relatório Excel", { status: 500 });
  }
}
