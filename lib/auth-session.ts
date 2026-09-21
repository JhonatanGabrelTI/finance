import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "blackfin_session";
export type Workspace = "business" | "personal";

const workspaces: Workspace[] = ["business", "personal"];

export function isWorkspace(value: unknown): value is Workspace {
  return typeof value === "string" && workspaces.includes(value as Workspace);
}

export function businessRegistrationCode() {
  return process.env.BLACKFIN_REGISTRATION_CODE ?? "160526";
}

export function businessPassword() {
  return process.env.BLACKFIN_ACCESS_PASSWORD ?? "Barbearia2026";
}

export function personalRegistrationCode() {
  return process.env.BLACKFIN_PERSONAL_REGISTRATION_CODE ?? "260926";
}

export function personalPassword() {
  return process.env.BLACKFIN_PERSONAL_PASSWORD ?? "Pessoal2026";
}

function sessionSecret() {
  return (
    process.env.BLACKFIN_SESSION_SECRET ??
    `${businessRegistrationCode()}:${businessPassword()}:${personalRegistrationCode()}:${personalPassword()}:blackfin-session`
  );
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function credentialsAreValid(
  workspace: Workspace,
  login: string,
  password: string,
) {
  const expectedLogin =
    workspace === "business" ? businessRegistrationCode() : personalRegistrationCode();
  const expectedPassword =
    workspace === "business" ? businessPassword() : personalPassword();
  return safeEqual(login, expectedLogin) && safeEqual(password, expectedPassword);
}

function sessionValue(workspace: Workspace) {
  return `blackfin:${workspace}:v2`;
}

export function createSessionToken(workspace: Workspace) {
  const value = sessionValue(workspace);
  const signature = createHmac("sha256", sessionSecret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

export function sessionWorkspace(token?: string): Workspace | null {
  if (!token) return null;
  return workspaces.find((workspace) => safeEqual(token, createSessionToken(workspace))) ?? null;
}

export function sessionTokenIsValid(token?: string) {
  return sessionWorkspace(token) !== null;
}

export function ownerForRequest(request: Request): { workspace: Workspace; owner: string } | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const encodedToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  let token: string | undefined;
  try {
    token = encodedToken ? decodeURIComponent(encodedToken) : undefined;
  } catch {
    return null;
  }
  const workspace = sessionWorkspace(token);
  if (!workspace) return null;
  const chatGptUser = request.headers.get("oai-authenticated-user-id");
  return { workspace, owner: `${chatGptUser ?? "blackfin"}:${workspace}` };
}
