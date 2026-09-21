import { NextResponse } from "next/server";
import { generateCursistasTemplateWorkbook } from "@/lib/spreadsheet";

export async function GET() {
  try {
    const buffer = generateCursistasTemplateWorkbook();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="modelo-importacao-cursistas.xlsx"',
      },
    });
  } catch (error) {
    console.error("Erro ao gerar modelo de planilha:", error);
    return new NextResponse("Erro ao gerar modelo", { status: 500 });
  }
}
