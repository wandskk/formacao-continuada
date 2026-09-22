import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove caracteres não numéricos de uma string (ex: CPF, telefone)
 */
export function sanitizeNumeric(val: string): string {
  return val.replace(/\D/g, "");
}

/**
 * Formata CPF para exibição: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const clean = sanitizeNumeric(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Mascara CPF para relatórios públicos/MEC: ***.456.789-**
 */
export function maskCPF(cpf: string): string {
  const clean = sanitizeNumeric(cpf);
  if (clean.length !== 11) return cpf;
  return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
}

/**
 * Aplica máscara de data de nascimento à medida que o usuário digita: DD/MM/AAAA
 */
export function formatDateInput(val: string): string {
  const digits = sanitizeNumeric(val).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Converte data nos formatos DD/MM/AAAA, DDMMAAAA ou YYYY-MM-DD para objeto Date UTC seguro
 */
export function parseBrazilianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Formato DD/MM/AAAA ou DD-MM-AAAA
  const brMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    if (
      year >= 1920 &&
      year <= new Date().getFullYear() &&
      month >= 0 &&
      month <= 11 &&
      day >= 1 &&
      day <= 31
    ) {
      const date = new Date(Date.UTC(year, month, day));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  // Formato DDMMAAAA (apenas 8 dígitos contínuos)
  const digits = sanitizeNumeric(clean);
  if (digits.length === 8) {
    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10) - 1;
    const year = parseInt(digits.slice(4, 8), 10);
    if (
      year >= 1920 &&
      year <= new Date().getFullYear() &&
      month >= 0 &&
      month <= 11 &&
      day >= 1 &&
      day <= 31
    ) {
      const date = new Date(Date.UTC(year, month, day));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  // Formato ISO AAAA-MM-DD
  const isoMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (
      year >= 1920 &&
      year <= new Date().getFullYear() &&
      month >= 0 &&
      month <= 11 &&
      day >= 1 &&
      day <= 31
    ) {
      const date = new Date(Date.UTC(year, month, day));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  return null;
}
