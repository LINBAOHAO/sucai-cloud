export const ADMIN_SESSION_COOKIE = "sucai-admin-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  id: string;
  exp: number;
  iat: number;
};

const revokedSessionIds = new Set<string>();

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "sucai-admin-dev-secret"
  );
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function randomSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

async function importSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signPayload(encodedPayload: string): Promise<string> {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );
  return Buffer.from(signature).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createAdminSession(): Promise<{ token: string; maxAge: number }> {
  const maxAge = SESSION_MAX_AGE_SECONDS;
  const now = Date.now();
  const payload: SessionPayload = {
    id: randomSessionId(),
    exp: now + maxAge * 1000,
    iat: now,
  };
  const encodedPayload = encodePayload(payload);
  const token = `${encodedPayload}.${await signPayload(encodedPayload)}`;
  return { token, maxAge };
}

export async function validateAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const encodedPayload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!encodedPayload || !signature) return false;

  const expectedSignature = await signPayload(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) return false;

  const payload = decodePayload(encodedPayload);
  if (!payload) return false;
  if (payload.exp <= Date.now()) return false;
  if (revokedSessionIds.has(payload.id)) return false;

  return true;
}

export function revokeAdminSession(token: string | undefined): void {
  if (!token) return;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return;

  const payload = decodePayload(token.slice(0, separator));
  if (payload) {
    revokedSessionIds.add(payload.id);
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function clearSessionCookieOptions() {
  return sessionCookieOptions(0);
}
