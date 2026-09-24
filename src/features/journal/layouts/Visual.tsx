"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import type { VisualArticle } from "@/content/journal";
import { Plate } from "@/components/media/Plate";

function Frame({ f, i, onActive }: { f: VisualArticle["frames"][number]; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.3, 1, 1, 0.3]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onActive(i), { rootMargin: "-50% 0px -50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [i, onActive]);

  return (
    <div ref={ref} className="relative h-[110svh] overflow-hidden">
      <motion.div style={{ scale, opacity }} className="absolute inset-0">
        <Plate {...f.plate} grain />
      </motion.div>
      {f.text && (
        <p className="t-serif absolute left-[var(--gutter)] top-[30%] max-w-[18ch] text-[clamp(1.8rem,3.6vw,3.6rem)] italic leading-[1.05] text-bone mix-blend-difference">
          {f.text}
        </p>
      )}
    </div>
  );
}

/** VISUAL STORY — the images carry it; one caption, sticky, changing with the light. */
export function VisualLayout({ a }: { a: VisualArticle }) {
  const [active, setActive] = useState(0);
  const f = a.frames[active];
  const [time, caption] = f.caption.split(" — ");

  return (
    <div className="relative bg-ink text-bone" data-tone="dark">
      <header className="flex min-h-svh flex-col justify-end px-[var(--gutter)] pb-16 pt-32">
        <p className="t-label opacity-60">
          {a.category} — Photographs by {a.author}
        </p>
        <h1 className="t-display mt-4 text-[clamp(3rem,10vw,11rem)] leading-[0.85]">{a.title}</h1>
        <p className="t-body mt-6 max-w-[40ch] opacity-70">{a.dek}</p>
      </header>

      <div className="relative">
        {a.frames.map((fr, k) => (
          <Frame key={k} f={fr} i={k} onActive={setActive} />
        ))}
        <div className="pointer-events-none sticky bottom-0 -mt-[40svh] flex h-[40svh] items-end justify-between gap-6 px-[var(--gutter)] pb-16">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6 }} className="text-bone mix-blend-difference">
              <p className="t-display text-[clamp(3rem,8vw,8rem)] tabular-nums leading-none">{time}</p>
              <p className="t-label mt-2 max-w-[36ch]">{caption}</p>
            </motion.div>
          </AnimatePresence>
          <p className="t-label text-bone mix-blend-difference">
            {String(active + 1).padStart(2, "0")} / {String(a.frames.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}
