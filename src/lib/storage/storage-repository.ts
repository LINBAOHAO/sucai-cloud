import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveSupabaseProjectUrl } from "@/lib/env/supabase-url";

export const PRODUCT_IMAGES_BUCKET = "product-images";

let adminClient: SupabaseClient | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(resolveSupabaseProjectUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!isStorageConfigured()) {
    throw new Error("Supabase Storage is not configured");
  }

  if (!adminClient) {
    adminClient = createClient(
      resolveSupabaseProjectUrl()!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  return adminClient;
}

export function getPublicStorageUrl(storagePath: string): string {
  const base = resolveSupabaseProjectUrl()!.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${storagePath}`;
}

export function extractStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function ensureProductImagesBucket(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET);
  if (exists) return;

  const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
}

export async function uploadObject(
  storagePath: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
): Promise<string> {
  await ensureProductImagesBucket();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  return getPublicStorageUrl(storagePath);
}

export async function deleteObject(storagePath: string): Promise<void> {
  if (!isStorageConfigured()) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function deleteObjects(storagePaths: string[]): Promise<void> {
  if (!isStorageConfigured() || storagePaths.length === 0) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(storagePaths);
  if (error) throw error;
}
