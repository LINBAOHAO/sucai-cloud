"use client";

import { motion, type Variants } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

const directionOffset = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeInProps) {
  const offset = directionOffset[direction];

  void offset;
  void delay;
  void direction;
  void duration;

  return (
    <motion.div className={className} initial={false} animate="visible">
      {children}
    </motion.div>
  );
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <FadeIn className={className}>
      <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      </div>
    </FadeIn>
  );
}
