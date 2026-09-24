"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";

/* Reusable typography. Everything large in VELOR is set with these. */

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const piece: Variants = {
  hidden: { y: "112%", rotate: 2 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } },
};

/**
 * Masked word/char reveal. One IntersectionObserver per block, GPU-only
 * transforms, and the full string stays available to screen readers.
 */
export function SplitReveal({
  text,
  as = "div",
  by = "word",
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
  immediate = false,
}: {
  text: string;
  as?: Tag;
  by?: "word" | "char";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  const parts = by === "char" ? Array.from(text) : text.split(" ");

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{text}</Plain>;
  }

  return (
    <MotionTag
      className={className}
      aria-label={text}
      variants={container(stagger, delay)}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once, margin: "0px 0px -12% 0px" } })}
    >
      {parts.map((p, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom" style={{ marginBottom: "-0.08em" }}>
          <motion.span className="inline-block origin-bottom-left" variants={piece}>
            {p === " " ? " " : p}
          </motion.span>
          {by === "word" && i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}

/** Fade-and-rise for blocks of content. */
export function Rise({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("t-label", className)}>{children}</span>;
}

/** Index line used at the top of every room section: "03 — WHY IT EXISTS". */
export function SectionMark({ n, title, className }: { n: string; title: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="t-label opacity-60">{n}</span>
      <span className="h-px w-10 bg-current opacity-30" />
      <span className="t-label">{title}</span>
    </div>
  );
}

export function Marquee({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <div className="marquee flex shrink-0" style={{ ["--marquee-speed" as string]: `${speed}s` }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
