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
