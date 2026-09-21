import * as XLSX from "xlsx";
import { z } from "zod";
import { sanitizeNumeric } from "./utils";

export interface ParsedCursistaRow {
  name: string;
  cpf: string;
  birthDate: Date;
  school?: string;
  function?: string;
  email?: string;
  phone?: string;
}

export interface SpreadsheetParseResult {
  validRows: ParsedCursistaRow[];
  errors: { row: number; reason: string; rawData: Record<string, any> }[];
  totalRows: number;
}

/**
 * Converte data em formatos comuns (DD/MM/AAAA, AAAA-MM-DD ou serial numérico do Excel) para Date UTC
 */
export function parseDate(value: any): Date | null {
  if (!value) return null;

  // Se já for uma instância de Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  // Se for número serial de data do Excel (ex: 35000)
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const millis = excelEpoch.getTime() + value * 86400000;
    const date = new Date(millis);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const cleanStr = value.trim();

    // Formato DD/MM/AAAA ou DD-MM-AAAA
    const brMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (brMatch) {
      const day = parseInt(brMatch[1], 10);
      const month = parseInt(brMatch[2], 10) - 1;
      const year = parseInt(brMatch[3], 10);
      const date = new Date(Date.UTC(year, month, day));
      return isNaN(date.getTime()) ? null : date;
    }

    // Formato AAAA-MM-DD
    const isoMatch = cleanStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const date = new Date(Date.UTC(year, month, day));
      return isNaN(date.getTime()) ? null : date;
    }

    // Tenta Date.parse nativo
    const parsed = new Date(cleanStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Normaliza o cabeçalho de colunas para busca tolerante
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Lê e valida um arquivo de planilha (XLSX ou CSV) contendo dados de cursistas
 */
export function parseCursistasSpreadsheet(buffer: Buffer): SpreadsheetParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { validRows: [], errors: [{ row: 0, reason: "A planilha está vazia.", rawData: {} }], totalRows: 0 };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const validRows: ParsedCursistaRow[] = [];
  const errors: { row: number; reason: string; rawData: Record<string, any> }[] = [];

  const seenCpfs = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // Linha 1 é o cabeçalho

    // Mapeia colunas de forma tolerante a variações
    let rawName = "";
    let rawCpf = "";
    let rawBirthDate: any = null;
    let rawSchool = "";
    let rawFunction = "";
    let rawEmail = "";
    let rawPhone = "";

    for (const [key, value] of Object.entries(row)) {
      const normKey = normalizeHeader(key);

      if (normKey === "nome" || normKey === "nomecompleto" || normKey === "professor") {
        rawName = String(value).trim();
      } else if (normKey === "cpf") {
        rawCpf = sanitizeNumeric(String(value));
      } else if (
        normKey.includes("nasc") ||
        normKey === "datanascimento" ||
        normKey === "dtnascimento"
      ) {
        rawBirthDate = value;
      } else if (normKey.includes("escola") || normKey.includes("lotacao") || normKey === "unidade") {
        rawSchool = String(value).trim();
      } else if (normKey.includes("cargo") || normKey.includes("funcao")) {
        rawFunction = String(value).trim();
      } else if (normKey.includes("email") || normKey.includes("correio")) {
        rawEmail = String(value).trim().toLowerCase();
      } else if (normKey.includes("tel") || normKey.includes("cel") || normKey.includes("whats")) {
        rawPhone = String(value).trim();
      }
    }

    // Validações
    if (!rawName) {
      errors.push({ row: rowNumber, reason: "Coluna 'Nome' não preenchida.", rawData: row });
      return;
    }

    if (!rawCpf || rawCpf.length !== 11) {
      errors.push({ row: rowNumber, reason: `CPF inválido ou não informado (${rawCpf || "vazio"}).`, rawData: row });
      return;
    }

    if (seenCpfs.has(rawCpf)) {
      errors.push({ row: rowNumber, reason: `CPF duplicado dentro da própria planilha (${rawCpf}).`, rawData: row });
      return;
    }
    seenCpfs.add(rawCpf);

    const parsedBirth = parseDate(rawBirthDate);
    if (!parsedBirth) {
      errors.push({
        row: rowNumber,
        reason: `Data de nascimento inválida (${String(rawBirthDate || "vazio")}). Utilize o formato DD/MM/AAAA.`,
        rawData: row,
      });
      return;
    }

    validRows.push({
      name: rawName,
      cpf: rawCpf,
      birthDate: parsedBirth,
      school: rawSchool || undefined,
      function: rawFunction || undefined,
      email: rawEmail || undefined,
      phone: rawPhone || undefined,
    });
  });

  return {
    validRows,
    errors,
    totalRows: rawRows.length,
  };
}

/**
 * Gera um buffer de planilha XLSX modelo para download
 */
export function generateCursistasTemplateWorkbook(): Buffer {
  const headers = [
    {
      "Nome Completo": "Maria Silva Santos",
      "CPF": "12345678901",
      "Data de Nascimento": "15/04/1985",
      "Escola": "E.M. Professora Ana Lúcia",
      "Cargo / Função": "Professora 1º Ano",
      "E-mail": "maria.silva@escola.gov.br",
      "Telefone": "(11) 98765-4321",
    },
    {
      "Nome Completo": "João Carlos de Oliveira",
      "CPF": "98765432100",
      "Data de Nascimento": "22/10/1990",
      "Escola": "E.M. Monteiro Lobato",
      "Cargo / Função": "Coordenador Pedagógico",
      "E-mail": "joao.oliveira@escola.gov.br",
      "Telefone": "(11) 97654-3210",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cursistas");

  // Ajusta largura de colunas
  worksheet["!cols"] = [
    { wch: 30 }, // Nome
    { wch: 16 }, // CPF
    { wch: 20 }, // Data Nascimento
    { wch: 30 }, // Escola
    { wch: 25 }, // Cargo
    { wch: 28 }, // Email
    { wch: 18 }, // Telefone
  ];

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
