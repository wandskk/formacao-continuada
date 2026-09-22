"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeNumeric } from "@/lib/utils";
import { verifyPassword, formatBirthDatePassword, hashPassword } from "@/lib/auth/password";
import { setSessionCookie, deleteSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .transform((val) => sanitizeNumeric(val))
    .refine((val) => val.length === 11, "O CPF deve conter 11 dígitos numéricos"),
  password: z.string().min(4, "A senha deve ter no mínimo 4 caracteres"),
});

export type LoginState = {
  success?: boolean;
  error?: string;
  redirectTo?: string;
};

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const rawCpf = formData.get("cpf") as string;
  const rawPassword = formData.get("password") as string;

  const validation = loginSchema.safeParse({
    cpf: rawCpf,
    password: rawPassword,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Dados inválidos.";
    return { error: firstError };
  }

  const { cpf, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    if (!user) {
      return { error: "CPF ou senha incorretos." };
    }

    let isPasswordValid = await verifyPassword(password, user.password);

    // Suporte à Decisão DEC-003: Validação da senha inicial baseada na data de nascimento
    if (!isPasswordValid && user.birthDate) {
      const birthPassword = formatBirthDatePassword(user.birthDate);
      if (password === birthPassword || sanitizeNumeric(password) === birthPassword) {
        isPasswordValid = true;
        // Atualiza a senha para o hash bcrypt (salva sem barras para padronização)
        const newHash = await hashPassword(birthPassword);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
      }
    }

    if (!isPasswordValid) {
      return { error: "CPF ou senha incorretos." };
    }

    // Cria o cookie de sessão seguro
    await setSessionCookie({
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      email: user.email,
    });

    // Rota de destino conforme papel (RBAC)
    let destination = "/cursista";
    if (user.role === "ADMIN") {
      destination = "/admin";
    } else if (user.role === "INSTRUTOR") {
      destination = "/instrutor";
    }

    return { success: true, redirectTo: destination };
  } catch (error) {
    console.error("Login action error:", error);
    return { error: "Erro interno no servidor ao realizar login. Tente novamente." };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
