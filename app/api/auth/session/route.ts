import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionTokenIsValid } from "@/lib/auth-session";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = sessionTokenIsValid(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
  return NextResponse.json({ authenticated });
}
