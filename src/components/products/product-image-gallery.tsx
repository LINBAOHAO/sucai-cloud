"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  productName: string;
  imageCount: number;
}

export function ProductImageGallery({ productName, imageCount }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const indices = Array.from({ length: imageCount }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="glass-card overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0d1424]"
          >
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                <Package className="h-12 w-12 text-orange-400/60" />
              </div>
              <span className="max-w-[80%] truncate text-sm text-muted-foreground/70">
                {productName}
              </span>
              <span className="text-xs text-orange-400/50">
                {activeIndex + 1} / {imageCount}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        {indices.map((index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative flex-1 overflow-hidden rounded-lg border-2 transition-all duration-200",
              activeIndex === index
                ? "border-orange-500 shadow-md shadow-orange-500/20"
                : "border-white/10 opacity-60 hover:border-orange-500/40 hover:opacity-100",
            )}
          >
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1a2332]">
              <Package
                className={cn(
                  "h-6 w-6 transition-colors",
                  activeIndex === index ? "text-orange-400" : "text-muted-foreground/50",
                )}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
