/**
 * Production environment variable checks.
 * Run via: npm run check:env
 */

import { isWeakAdminPassword } from "@/lib/admin/auth";
import { resolveSupabaseProjectUrl } from "@/lib/env/supabase-url";

export const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "ADMIN_EMAIL",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
] as const;

export type EnvVarName = (typeof REQUIRED_ENV_VARS)[number];

export type EnvCheckResult = {
  name: EnvVarName;
  present: boolean;
  warning?: string;
};

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.startsWith("REPLACE_") || value.startsWith("your-");
}

export function checkRequiredEnvVars(
  env: NodeJS.ProcessEnv = process.env,
): EnvCheckResult[] {
  return REQUIRED_ENV_VARS.map((name) => {
    const value = env[name]?.trim();
    const present = Boolean(value) && !isPlaceholder(value);
    const result: EnvCheckResult = { name, present };

    if (!present) {
      result.warning = `Missing or placeholder ${name}`;
      return result;
    }

    if (name === "ADMIN_PASSWORD" && isWeakAdminPassword(value!)) {
      result.warning = `${name} uses a weak value — use at least 12 characters`;
    }

    if (name === "FROM_EMAIL" && value?.includes("resend.dev") && env.NODE_ENV === "production") {
      result.warning = "FROM_EMAIL uses Resend sandbox address — verify your domain for production";
    }

    return result;
  });
}

export function formatEnvCheckReport(
  results: EnvCheckResult[],
  env: NodeJS.ProcessEnv = process.env,
): string {
  const lines = ["Environment variable check", "========================"];

  const supabaseUrl = resolveSupabaseProjectUrl();
  if (supabaseUrl) {
    lines.push(`✅ Supabase URL (${supabaseUrl})`);
  } else {
    lines.push("⚠️  WARNING: Supabase project URL not configured");
  }

  for (const result of results) {
    if (result.warning) {
      lines.push(`⚠️  WARNING: ${result.warning}`);
    } else if (result.present) {
      lines.push(`✅ ${result.name}`);
    }
  }

  if (env.NODE_ENV === "production" && !env.ADMIN_SESSION_SECRET?.trim()) {
    lines.push("⚠️  WARNING: ADMIN_SESSION_SECRET is required in production");
  }

  const warnings = results.filter((r) => r.warning);
  if (!supabaseUrl) warnings.push({ name: "DATABASE_URL", present: false, warning: "no supabase url" });

  lines.push("");
  lines.push(
    warnings.length === 0
      ? "All required variables are set."
      : `${warnings.length} warning(s) — review before deploying.`,
  );

  return lines.join("\n");
}

export function hasBlockingEnvIssues(results: EnvCheckResult[]): boolean {
  return results.some((r) => !r.present);
}
