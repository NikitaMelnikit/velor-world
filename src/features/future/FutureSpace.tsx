"use client";

import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { concepts, type Concept } from "@/content/world";
import { cn } from "@/lib/utils";
import { useScroll } from "@/components/providers/SmoothScroll";
import { CollectButton } from "@/components/collect/CollectButton";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Waveform } from "@/components/sound/Waveform";
import { BreathingWall, GravityShelf, LiquidStone, MemorySurface, MyceliumLight, UnfinishedVessel } from "./Prototypes";

const widgets: Record<Concept["widget"], ComponentType> = {
  breathing: BreathingWall,
  memory: MemorySurface,
  mycelium: MyceliumLight,
  unfinished: UnfinishedVessel,
  gravity: GravityShelf,
  liquid: LiquidStone,
};

export const collectConcept = (c: Concept) => ({
  id: `concept:${c.slug}`,
  kind: "concept" as const,
  title: c.name,
  href: "/future",
  meta: `${c.code} — ${c.status}`,
  ref: c.slug,
});

/** Irregular placements — some concepts are allowed to lean out of the grid. */
const placement = [
  "md:col-span-7 md:h-[62vh]",
  "md:col-span-5 md:h-[48vh] md:mt-[18vh]",
  "md:col-span-4 md:h-[56vh] md:-mt-[6vh]",
  "md:col-span-4 md:h-[44vh] md:mt-[10vh] md:rotate-[-1.2deg]",
  "md:col-span-4 md:h-[52vh]",
  "md:col-span-8 md:col-start-3 md:h-[50vh] md:mt-[6vh]",
];

const statusTone: Record<Concept["status"], string> = {
  PROTOTYPE: "border-bone/60",
  SPECULATIVE: "border-brass text-brass",
  UNFINISHED: "border-dashed border-bone/50",
  "IN GROWTH": "border-[#9bc28a] text-[#9bc28a]",
  IMPOSSIBLE: "border-rust text-[#d0643c]",
};

/**
 * 08 — FUTURE. Not a shop. A space for things that may never exist:
 * interactive prototypes, speculative materials, unfinished thoughts.
 */
export function FutureSpace() {
  const [open, setOpen] = useState<Concept | null>(null);
  const { lenis } = useScroll();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const on = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", on);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", on);
    };
  }, [open, lenis]);

  return (
    <div className="relative bg-[#0a0a09] text-bone" data-tone="dark">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)", backgroundSize: "64px 64px" }}
        aria-hidden
      />

      <header className="relative px-[var(--gutter)] pb-20 pt-32">
        <p className="t-label opacity-60">08 — Future / Experimental space</p>
        <h1 className="t-display mt-4 flex text-[clamp(5rem,26vw,30rem)] leading-[0.78]" aria-label="FUTURE">
          {"FUTURE".split("").map((l, i) => (
            <span key={i} aria-hidden className="inline-block" style={{ animation: `unstable ${3 + i * 0.7}s ease-in-out ${i * 0.3}s infinite alternate` }}>
              {l}
            </span>
          ))}
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="t-serif max-w-[20ch] text-[clamp(2rem,4vw,4rem)] italic leading-[1]">Not everything here is meant to exist.</p>
          <div className="flex items-center gap-4">
            <span className="block h-8 w-40 text-brass">
              <Waveform amp={0.5} freq={4} noise={0.35} speed={1.8} />
            </span>
            <span className="t-label opacity-60">
              {concepts.length} concepts · 0 for sale
            </span>
          </div>
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-x-6 gap-y-16 px-[var(--gutter)] pb-[18vh] md:grid-cols-12">
        {concepts.map((c, i) => {
          const W = widgets[c.widget];
          return (
            <motion.article
              key={c.slug}
              className={cn("flex flex-col", placement[i])}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="t-label opacity-60">{c.code}</span>
                <span className={cn("t-label border px-2 py-0.5 text-[0.6rem]", statusTone[c.status])}>{c.status}</span>
              </div>
              <div className="relative h-[52svh] flex-1 overflow-hidden border border-bone/10 md:h-auto">
                <W />
                <span className="t-label pointer-events-none absolute bottom-3 left-3 bg-black/50 px-2 py-1 text-[0.6rem]">{c.hint}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className={cn("t-display text-3xl", c.status === "UNFINISHED" && "opacity-70")}>{c.name}</h2>
                  <p className="t-body mt-1 max-w-[42ch] text-[0.95rem] opacity-70">{c.line}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button type="button" onClick={() => setOpen(c)} className="t-label border-b border-bone/40 pb-0.5" data-cursor="Expand">
                    Study →
                  </button>
                  <CollectButton item={collectConcept(c)} compact />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <section className="relative px-[var(--gutter)] pb-[16vh]">
        <p className="t-label opacity-60">You reached the edge of the world.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TransitionLink href="/collection" className="t-label bg-bone px-6 py-4 text-ink" data-cursor="Keep">
            Open your collection →
          </TransitionLink>
          <TransitionLink href="/world" className="t-label border border-bone/30 px-6 py-4" data-cursor="Map">
            Back to the map
          </TransitionLink>
          <TransitionLink href="/" className="t-label border border-bone/30 px-6 py-4" data-cursor="Entry">
            Return to the entry
          </TransitionLink>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0a0a09]/95 px-[var(--gutter)] pb-16 pt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
            <motion.div
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.5fr_1fr]"
              role="dialog"
              aria-modal
              aria-label={open.name}
            >
              <div className="relative h-[60svh] overflow-hidden border border-bone/10">
                {(() => {
                  const W = widgets[open.widget];
                  return <W />;
                })()}
              </div>
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <p className="t-label opacity-60">
                    {open.code} · {open.status}
                  </p>
                  <h2 className="t-display mt-2 text-5xl">{open.name}</h2>
                  <p className="t-serif mt-6 text-3xl italic leading-tight">{open.line}</p>
                  <p className="t-body mt-6 opacity-75">{open.text}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <CollectButton item={collectConcept(open)} />
                  <button type="button" onClick={() => setOpen(null)} className="t-label border border-bone/30 px-4 py-2.5">
                    Close ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes unstable { 0% { font-variation-settings: "wdth" 125; } 50% { font-variation-settings: "wdth" 70; opacity: .85 } 100% { font-variation-settings: "wdth" 110; } }`}</style>
    </div>
  );
}
