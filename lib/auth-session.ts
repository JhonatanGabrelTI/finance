import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "blackfin_session";
const SESSION_VALUE = "blackfin-authenticated-v1";

export function registrationCode() {
  return process.env.BLACKFIN_REGISTRATION_CODE ?? "160526";
}

export function accessPassword() {
  return process.env.BLACKFIN_ACCESS_PASSWORD ?? "Barbearia2026";
}

function sessionSecret() {
  return (
    process.env.BLACKFIN_SESSION_SECRET ??
    `${registrationCode()}:${accessPassword()}:blackfin-session`
  );
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function credentialsAreValid(code: string, password: string) {
  return (
    safeEqual(code, registrationCode()) &&
    safeEqual(password, accessPassword())
  );
}

export function createSessionToken() {
  const signature = createHmac("sha256", sessionSecret())
    .update(SESSION_VALUE)
    .digest("hex");
  return `${SESSION_VALUE}.${signature}`;
}

export function sessionTokenIsValid(token?: string) {
  if (!token) return false;
  return safeEqual(token, createSessionToken());
}
