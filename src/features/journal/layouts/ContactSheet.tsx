"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ContactArticle } from "@/content/journal";
import { cn } from "@/lib/utils";
import { Plate } from "@/components/media/Plate";
import { Rise, SplitReveal } from "@/components/type";

/** BEHIND THE SCENES — the story is a contact sheet; one frame is circled. */
export function ContactLayout({ a }: { a: ContactArticle }) {
  const [open, setOpen] = useState<number | null>(null);
  const f = open !== null ? a.frames[open] : null;

  return (
    <div className="bg-[#161512] text-bone" data-tone="dark">
      <header className="px-[var(--gutter)] pb-12 pt-32">
        <p className="t-label opacity-60">
          {a.category} — {a.author}
        </p>
        <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-condensed mt-4 text-[clamp(5rem,22vw,24rem)] uppercase leading-[0.8]" />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <p className="t-body max-w-[48ch] opacity-75">{a.intro}</p>
          <p className="t-label self-end opacity-60 md:text-right">Kodak Tri-X 400 · Roll 01–12 · Studio table, north window</p>
        </div>
      </header>

      <div className="mx-[var(--gutter)] mb-[12vh] bg-black p-3 md:p-6">
        <div className="t-label mb-3 flex justify-between text-[#e0b04a]/80">
          <span>VELOR ▸ 412</span>
          <span>SAFETY FILM</span>
        </div>
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {a.frames.map((fr, k) => (
            <li key={fr.code}>
              <button type="button" onClick={() => setOpen(k)} data-cursor="Loupe" className="group block w-full text-left">
                <Rise delay={(k % 4) * 0.06}>
                  <div className="relative aspect-[4/3] overflow-hidden grayscale">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                      <Plate {...fr.plate} />
                    </div>
                    {fr.marked && (
                      <svg viewBox="0 0 100 75" className="absolute inset-[-6%] h-[112%] w-[112%]" aria-hidden>
                        <ellipse cx="50" cy="37" rx="44" ry="32" fill="none" stroke="#d33a2c" strokeWidth="2" transform="rotate(-4 50 37)" />
                      </svg>
                    )}
                  </div>
                  <div className="t-label mt-2 flex justify-between text-[#e0b04a]/80">
                    <span>{fr.code}</span>
                    <span>{k + 1}A</span>
                  </div>
                  <p className="mt-1 text-sm leading-snug opacity-70">{fr.caption}</p>
                </Rise>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="px-[var(--gutter)] pb-[16vh]">
        <Rise>
          <p className="t-serif max-w-[30ch] text-[clamp(1.8rem,3.4vw,3.4rem)] italic leading-[1.1]">{a.outro}</p>
        </Rise>
      </div>

      <AnimatePresence>
        {f && open !== null && (
          <motion.div
            role="dialog"
            aria-modal
            aria-label={f.code}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.figure
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-[min(90vw,64rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Plate {...f.plate} grain />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
                <span className="t-display text-2xl">{f.code}</span>
                <span className="t-body opacity-80">{f.caption}</span>
                <span className="t-label opacity-60">{f.time}</span>
              </figcaption>
              <div className="mt-6 flex gap-3">
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setOpen((o) => (o === null ? o : (o + d + a.frames.length) % a.frames.length))}
                    className={cn("t-label border border-bone/30 px-4 py-2")}
                  >
                    {d < 0 ? "← Previous frame" : "Next frame →"}
                  </button>
                ))}
                <button type="button" onClick={() => setOpen(null)} className="t-label ml-auto px-4 py-2">
                  Close ✕
                </button>
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
