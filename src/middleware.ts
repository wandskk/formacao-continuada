import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "fc_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "chave_secreta_padrao_formacao_continuada_2026_selo_mec"
);

interface SessionPayload {
  id: string;
  role: "ADMIN" | "INSTRUTOR" | "CURSISTA";
}

async function getMiddlewareSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getMiddlewareSession(request);

  // Se já está logado e tenta acessar a página de login, redireciona para seu painel
  if (pathname === "/login") {
    if (session) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (session.role === "INSTRUTOR") {
        return NextResponse.redirect(new URL("/instrutor", request.url));
      }
      return NextResponse.redirect(new URL("/cursista", request.url));
    }
    return NextResponse.next();
  }

  // Rotas restritas que exigem login
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instrutor") ||
    pathname.startsWith("/cursista");

  if (isProtectedPath) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Controle de Acesso Baseado em Papel (RBAC)
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      // Instrutor vai para seu painel, cursista vai para o dele
      const target = session.role === "INSTRUTOR" ? "/instrutor" : "/cursista";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname.startsWith("/instrutor") && session.role !== "INSTRUTOR" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/cursista", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instrutor/:path*",
    "/cursista/:path*",
    "/login",
  ],
};
