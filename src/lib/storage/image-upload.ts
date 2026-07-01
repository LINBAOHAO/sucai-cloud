import { randomUUID } from "crypto";
import {
  deleteObject,
  extractStoragePathFromPublicUrl,
  getPublicStorageUrl,
  isStorageConfigured,
  uploadObject,
} from "@/lib/storage/storage-repository";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageUploadInput = {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
};

export function validateImageUpload(input: Pick<ImageUploadInput, "name" | "type" | "size">): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(input.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "仅支持 JPG、PNG、WEBP 格式";
  }

  const lowerName = input.name.toLowerCase();
  const hasAllowedExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasAllowedExt) {
    return "文件扩展名无效";
  }

  if (input.size <= 0) {
    return "文件为空";
  }

  if (input.size > MAX_IMAGE_BYTES) {
    return "单张图片不能超过 5MB";
  }

  return null;
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function buildProductImageStoragePath(productId: string, mimeType: string): string {
  const ext = extensionForMime(mimeType);
  return `${productId}/${randomUUID()}.${ext}`;
}

export async function uploadProductImageFile(
  productId: string,
  input: ImageUploadInput,
): Promise<{ url: string; storagePath: string }> {
  if (!isStorageConfigured()) {
    throw new Error("Supabase Storage is not configured");
  }

  const validationError = validateImageUpload(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const storagePath = buildProductImageStoragePath(productId, input.type);
  const url = await uploadObject(storagePath, input.buffer, input.type);

  return { url, storagePath };
}

export async function deleteProductImageFile(imageUrl: string): Promise<void> {
  const storagePath = extractStoragePathFromPublicUrl(imageUrl);
  if (!storagePath) return;
  await deleteObject(storagePath);
}

export function resolveImagePublicUrl(storagePath: string): string {
  return getPublicStorageUrl(storagePath);
}
