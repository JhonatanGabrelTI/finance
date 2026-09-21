import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionWorkspace } from "@/lib/auth-session";

export async function GET() {
  const cookieStore = await cookies();
  const workspace = sessionWorkspace(cookieStore.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authenticated: Boolean(workspace), workspace });
}
