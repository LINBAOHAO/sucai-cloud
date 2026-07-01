"use client";

import Image from "next/image";
import { ProductPlaceholder } from "@/components/home/product-placeholder";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  imageUrl?: string | null;
  label?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductThumbnail({
  imageUrl,
  label,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
  priority = false,
}: ProductThumbnailProps) {
  if (!imageUrl) {
    return <ProductPlaceholder label={label} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      <Image
        src={imageUrl}
        alt={label ?? "Product image"}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
