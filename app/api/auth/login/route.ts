import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  credentialsAreValid,
  SESSION_COOKIE,
} from "@/lib/auth-session";

const inputSchema = z.object({
  registrationCode: z.string().trim().min(1).max(30),
  password: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    !credentialsAreValid(
      parsed.data.registrationCode,
      parsed.data.password,
    )
  ) {
    return NextResponse.json(
      { error: "Código de registro ou senha incorretos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
