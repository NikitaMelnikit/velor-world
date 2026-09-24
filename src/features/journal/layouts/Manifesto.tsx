"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ManifestoArticle } from "@/content/journal";
import { cn } from "@/lib/utils";
import { Plate } from "@/components/media/Plate";
import { SplitReveal } from "@/components/type";

/** CULTURE — split screen: a fixed numeral on the left, the argument on the right. */
export function ManifestoLayout({ a }: { a: ManifestoArticle }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-[#d9c9ad] text-[#1d140c]" data-tone="light">
      <header className="px-[var(--gutter)] pb-10 pt-32">
        <p className="t-label opacity-60">
          {a.category} — {a.author} — {a.read}
        </p>
        <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-serif mt-4 max-w-[16ch] text-[clamp(3rem,8vw,9rem)] italic leading-[0.92]" />
        <p className="t-body mt-6 max-w-[48ch] opacity-75">{a.dek}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative hidden md:block">
          <div className="sticky top-0 h-svh overflow-hidden">
            <div className="absolute inset-0 opacity-80">
              <Plate {...a.cover} />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  className="t-serif text-[clamp(10rem,24vw,26rem)] italic leading-none text-paper mix-blend-difference"
                  initial={{ opacity: 0, y: 60, rotate: -6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  {a.chapters[active].n}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-10 left-8 flex gap-2">
              {a.chapters.map((c, k) => (
                <span key={c.n} className={cn("block h-1 transition-all duration-700", k === active ? "w-10 bg-paper" : "w-3 bg-paper/40")} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-[var(--gutter)] md:px-[4vw]">
          {a.chapters.map((c, k) => (
            <section
              key={c.n}
              data-i={k}
              ref={(el) => {
                refs.current[k] = el;
              }}
              className="flex min-h-[90svh] flex-col justify-center border-t border-[#1d140c]/15 py-16"
            >
              <p className="t-label opacity-60">Chapter {c.n}</p>
              <h2 className="t-display mt-3 text-[clamp(2.6rem,5vw,5.4rem)] uppercase">{c.title}</h2>
              <p className="t-body mt-6 max-w-[40ch] text-[1.2rem] leading-[1.7] opacity-85">{c.text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
