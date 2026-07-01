const WEAK_PASSWORDS = new Set(["change-me", "admin", "password", "123456"]);

export function isWeakAdminPassword(password: string): boolean {
  const normalized = password.trim();
  if (!normalized || WEAK_PASSWORDS.has(normalized)) return true;
  return normalized.length < 12;
}

export function getAdminConfigError(): string | null {
  if (process.env.NODE_ENV !== "production") return null;

  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password.trim()) {
    return "ADMIN_PASSWORD is not configured";
  }
  if (isWeakAdminPassword(password)) {
    return "ADMIN_PASSWORD is too weak for production";
  }
  if (!process.env.ADMIN_SESSION_SECRET?.trim()) {
    return "ADMIN_SESSION_SECRET is required in production";
  }
  return null;
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin",
  };
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}
