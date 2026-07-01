"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Loader2, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminProductImage } from "@/lib/admin/types";
import { ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from "@/lib/storage/image-upload";
import { cn } from "@/lib/utils";

interface AdminProductImagesProps {
  productId: string;
}

export function AdminProductImages({ productId }: AdminProductImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`);
      if (!res.ok) {
        throw new Error("加载图片失败");
      }
      setImages((await res.json()) as AdminProductImage[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载图片失败");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const file = fileList[0];

    if (file.size > MAX_IMAGE_BYTES) {
      setError("单张图片不能超过 5MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "上传失败");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("确定删除该图片？存储文件与数据库记录将一并删除。")) return;

    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("删除失败");
      return;
    }
    await refresh();
  };

  const patchImages = async (payload: { action: "reorder" | "setPrimary"; imageIds?: string[]; imageId?: string }) => {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("更新排序失败");
      return;
    }
    setImages((await res.json()) as AdminProductImage[]);
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    await patchImages({ action: "reorder", imageIds: next.map((image) => image.id) });
  };

  const accept = ALLOWED_IMAGE_EXTENSIONS.join(",");

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>产品图片</Label>
          <p className="text-xs text-slate-500">支持 JPG / PNG / WEBP，单张最大 5MB</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            上传图片
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载图片中…
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          暂无图片，前台将显示默认占位图
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "flex gap-3 rounded-xl border bg-white p-3",
                index === 0 ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200",
              )}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image src={image.url} alt={image.alt ?? "产品图片"} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="text-xs text-slate-500">
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600">
                      <Star className="h-3 w-3 fill-current" />
                      主图
                    </span>
                  ) : (
                    `排序 ${index + 1}`
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {index !== 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => void patchImages({ action: "setPrimary", imageId: image.id })}
                    >
                      <Star className="h-3.5 w-3.5" />
                      设为主图
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={index === 0}
                    onClick={() => void moveImage(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={index === images.length - 1}
                    onClick={() => void moveImage(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                    onClick={() => void handleDelete(image.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
