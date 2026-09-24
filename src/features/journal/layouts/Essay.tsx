"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { EssayArticle } from "@/content/journal";
import { Plate } from "@/components/media/Plate";
import { Rise, SplitReveal } from "@/components/type";

/** ESSAY — centred title, long measure, drop cap, notes living in the margin. */
export function EssayLayout({ a }: { a: EssayArticle }) {
  const cover = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cover, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div className="bg-paper text-ink" data-tone="light">
      <header className="flex min-h-[86svh] flex-col items-center justify-center px-[var(--gutter)] pb-16 pt-32 text-center">
        <p className="t-label opacity-60">
          {a.category} — {a.read}
        </p>
        <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-serif mt-6 max-w-[14ch] text-[clamp(3.4rem,10vw,11rem)] italic leading-[0.9]" />
        <p className="t-body mt-8 max-w-[44ch] opacity-75">{a.dek}</p>
        <p className="t-label mt-8 opacity-60">
          Words by {a.author} · {a.date}
        </p>
      </header>

      <div ref={cover} className="relative mx-[var(--gutter)] h-[72svh] overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-[-12%_0]">
          <Plate {...a.cover} grain />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 px-[var(--gutter)] py-[14vh] md:grid-cols-12">
        {a.body.map((b, k) => (
          <div key={k} className="contents">
            <Rise className="md:col-span-6 md:col-start-3">
              <p
                className={
                  k === 0
                    ? "t-body mb-8 text-[1.2rem] leading-[1.75] first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-serif)] first-letter:text-[5.6rem] first-letter:leading-[0.8]"
                    : "t-body mb-8 text-[1.15rem] leading-[1.75]"
                }
              >
                {b.p}
              </p>
            </Rise>
            <aside className="md:col-span-3 md:col-start-10">
              {b.note && (
                <Rise delay={0.2}>
                  <p className="t-label mb-8 border-l border-ink/30 pl-4 normal-case tracking-normal opacity-70">
                    <span className="mr-2 text-rust">*</span>
                    {b.note}
                  </p>
                </Rise>
              )}
            </aside>
            {k === 3 && (
              <blockquote className="my-[8vh] md:col-span-10 md:col-start-2">
                <SplitReveal text={`“${a.pull}”`} className="t-serif text-[clamp(2.2rem,5vw,5.4rem)] italic leading-[1]" />
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
