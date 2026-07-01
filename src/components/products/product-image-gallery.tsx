"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import type { ProductImageItem } from "@/lib/product-types";
import { sortProductImages } from "@/lib/products/product-image-utils";
import { ProductPlaceholder } from "@/components/home/product-placeholder";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  productName: string;
  images?: ProductImageItem[];
}

export function ProductImageGallery({ productName, images = [] }: ProductImageGalleryProps) {
  const sortedImages = sortProductImages(images);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const closeZoom = useCallback(() => setZoomOpen(false), []);
  const hasImages = sortedImages.length > 0;
  const activeImage = hasImages ? sortedImages[activeIndex] : null;
  const displayCount = hasImages ? sortedImages.length : 1;

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomOpen, closeZoom]);

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => hasImages && setZoomOpen(true)}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50",
            hasImages &&
              "transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60",
          )}
          aria-label={hasImages ? "Zoom product image" : "Product placeholder"}
        >
          {hasImages && activeImage ? (
            <div className="relative aspect-square">
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <ProductPlaceholder label={productName} className="aspect-square rounded-none" />
          )}
        </button>

        {hasImages && sortedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "overflow-hidden rounded-xl border-2 bg-white transition-all duration-200",
                  activeIndex === index
                    ? "border-blue-600 shadow-md shadow-blue-100/80"
                    : "border-slate-200 opacity-70 hover:border-blue-300 hover:opacity-100",
                )}
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt ?? productName}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {hasImages && (
          <p className="text-center text-xs text-slate-500">
            {activeIndex + 1} / {displayCount}
          </p>
        )}
      </div>

      {zoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={closeZoom}
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
        >
          <button
            type="button"
            onClick={closeZoom}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square min-w-[280px] sm:min-w-[480px]">
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? productName}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain p-4"
              />
            </div>
            <div className="border-t border-slate-100 px-6 py-4 text-center">
              <p className="font-semibold text-slate-800">{productName}</p>
              <p className="mt-1 text-sm text-slate-500">
                Image {activeIndex + 1} of {sortedImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
