import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  credentialsAreValid,
  SESSION_COOKIE,
} from "@/lib/auth-session";

const inputSchema = z.object({
  workspace: z.enum(["business", "personal"]),
  login: z.string().trim().regex(/^\d{6,30}$/, "Use apenas números no código de acesso."),
  password: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    !credentialsAreValid(
      parsed.data.workspace,
      parsed.data.login,
      parsed.data.password,
    )
  ) {
    return NextResponse.json(
      { error: "Login ou senha incorretos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ authenticated: true, workspace: parsed.data.workspace });
  response.cookies.set(SESSION_COOKIE, createSessionToken(parsed.data.workspace), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
