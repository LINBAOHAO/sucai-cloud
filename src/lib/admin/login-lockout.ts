import { getClientIp } from "@/lib/rate-limit";

const MAX_FAILURES = 5;
const LOCK_DURATION_MS = 10 * 60 * 1000;

type LockRecord = {
  failures: number;
  lockedUntil?: number;
};

const lockRecords = new Map<string, LockRecord>();

function getRecord(ip: string): LockRecord {
  const existing = lockRecords.get(ip);
  if (existing) return existing;
  const created: LockRecord = { failures: 0 };
  lockRecords.set(ip, created);
  return created;
}

export function getLoginClientIp(request: Request): string {
  return getClientIp(request);
}

export function checkLoginLockout(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const record = lockRecords.get(ip);
  if (!record?.lockedUntil) {
    return { allowed: true };
  }

  const now = Date.now();
  if (now >= record.lockedUntil) {
    lockRecords.delete(ip);
    return { allowed: true };
  }

  return { allowed: false, retryAfterMs: record.lockedUntil - now };
}

export function recordLoginFailure(ip: string): void {
  const record = getRecord(ip);
  record.failures += 1;

  if (record.failures >= MAX_FAILURES) {
    record.lockedUntil = Date.now() + LOCK_DURATION_MS;
    record.failures = 0;
  }
}

export function clearLoginFailures(ip: string): void {
  lockRecords.delete(ip);
}
