import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const INQUIRY_LIMIT = 5;
const INQUIRY_WINDOW = "1 m";

let warnedMissingConfig = false;
let inquiryRatelimit: Ratelimit | null = null;

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function warnMissingConfigOnce(): void {
  if (warnedMissingConfig || process.env.NODE_ENV !== "development") {
    return;
  }
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured; rate limiting disabled.",
  );
  warnedMissingConfig = true;
}

function getInquiryRatelimit(): Ratelimit | null {
  if (!isUpstashConfigured()) {
    warnMissingConfigOnce();
    return null;
  }

  if (!inquiryRatelimit) {
    inquiryRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(INQUIRY_LIMIT, INQUIRY_WINDOW),
      prefix: "ratelimit:inquiry",
    });
  }

  return inquiryRatelimit;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) {
      return ip;
    }
  }

  const requestWithIp = request as Request & { ip?: string };
  if (requestWithIp.ip) {
    return requestWithIp.ip;
  }

  return "unknown";
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const limiter = getInquiryRatelimit();
  if (!limiter) {
    return { allowed: true };
  }

  try {
    const { success } = await limiter.limit(ip);
    return { allowed: success };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[rate-limit] Upstash request failed; allowing request.", error);
    }
    return { allowed: true };
  }
}
