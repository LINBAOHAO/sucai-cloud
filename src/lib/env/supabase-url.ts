/** Derive Supabase project URL from a direct Postgres DATABASE_URL when unset. */
export function resolveSupabaseProjectUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const databaseUrl = process.env.DATABASE_URL ?? "";
  const match = databaseUrl.match(/@db\.([a-z0-9-]+)\.supabase\.co/i);
  if (match) {
    return `https://${match[1]}.supabase.co`;
  }

  return null;
}
