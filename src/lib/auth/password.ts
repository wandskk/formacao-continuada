import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Gera hash seguro para a senha utilizando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com o hash armazenado
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Formata data de nascimento no formato DDMMAAAA (usado para a senha padrão de cursistas)
 */
export function formatBirthDatePassword(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}${month}${year}`;
}
