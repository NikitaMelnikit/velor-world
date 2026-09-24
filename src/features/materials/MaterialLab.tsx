"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { materials } from "@/content/materials";
import type { LabMaterial } from "@/content/types";
import { cn } from "@/lib/utils";
import { Specimen } from "./Specimen";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";
import { SplitReveal } from "@/components/type";
import { Waveform } from "@/components/sound/Waveform";

export const collectMaterial = (m: LabMaterial) => ({
  id: `material:${m.slug}`,
  kind: "material" as const,
  title: m.name,
  href: `/materials/${m.slug}`,
  meta: `${m.code} — ${m.spec}`,
  ref: m.slug,
});

/** Asymmetric bench layout — specimens are placed, not gridded. */
const layout = [
  "md:col-span-5 md:h-[64vh]",
  "md:col-span-4 md:col-start-7 md:mt-[14vh] md:h-[50vh]",
  "md:col-span-3 md:col-start-10 md:-mt-[6vh] md:h-[40vh]",
  "md:col-span-4 md:col-start-2 md:mt-[4vh] md:h-[54vh]",
  "md:col-span-3 md:col-start-6 md:-mt-[16vh] md:h-[66vh]",
  "md:col-span-4 md:col-start-9 md:mt-[6vh] md:h-[46vh]",
];

/**
 * 05 — MATERIAL LAB. A digital laboratory bench: six specimens that react
 * physically to the pointer. Metal reflects, glass bends, stone reveals,
 * fabric yields, wood shows its grain, composite opens its layers.
 */
export function MaterialLab() {
  const [hover, setHover] = useState<LabMaterial | null>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (!readout.current) return;
      readout.current.textContent = `X ${(e.clientX / window.innerWidth).toFixed(3)} · Y ${(e.clientY / window.innerHeight).toFixed(3)}`;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  return (
    <div className="bg-[#101010] text-bone" data-tone="dark">
      <header className="px-[var(--gutter)] pb-16 pt-32">
        <p className="t-label mb-4 opacity-60">05 — Materials / Laboratory</p>
        <SplitReveal as="h1" text="MATERIAL LAB" immediate delay={0.2} className="t-display size-huge" />
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto]">
          <p className="t-body max-w-[46ch] opacity-70">
            Six specimens on the bench. Don&apos;t read about them — touch them. Each one answers the pointer the way it answers light, heat and hands.
          </p>
          <div className="t-label flex flex-col items-start gap-1 opacity-70 md:items-end">
            <span>Bench temperature 19.4°C · RH 42%</span>
            <span ref={readout} className="tabular-nums">
              X 0.000 · Y 0.000
            </span>
          </div>
        </div>
      </header>

      {/* Live instrument bar */}
      <div className="sticky top-16 z-20 mx-[var(--gutter)] mb-10 flex items-center justify-between gap-6 border-y border-bone/10 bg-[#101010]/90 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <span className="block h-5 w-16 shrink-0 text-brass">
            <Waveform mode="bars" bars={12} amp={hover ? 0.7 : 0.2} freq={hover ? 3 : 1} speed={hover ? 1.6 : 0.6} />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={hover?.slug ?? "none"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="t-label truncate"
            >
              {hover ? `Specimen ${hover.code} — ${hover.name} — ${hover.reaction}` : "Awaiting contact — move over a specimen"}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="t-label hidden shrink-0 opacity-50 md:block">Reaction log</span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-14 px-[var(--gutter)] pb-[22vh] md:grid-cols-12">
        {materials.map((m, i) => (
          <article key={m.slug} className={cn("group flex flex-col", layout[i])} onMouseEnter={() => setHover(m)} onMouseLeave={() => setHover(null)}>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="t-label opacity-60">{m.code}</span>
              <span className="t-label opacity-60">{m.spec}</span>
            </div>
            <TransitionLink href={`/materials/${m.slug}`} fromPointer data-cursor="Open" className="relative block h-[62svh] flex-1 md:h-auto" aria-label={`Open specimen ${m.name}`}>
              <Specimen slug={m.slug} className="absolute inset-0" />
              <span className="pointer-events-none absolute inset-0 border border-bone/0 transition-colors duration-500 group-hover:border-bone/40" />
            </TransitionLink>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="t-display text-3xl">{m.name}</h2>
                <p className="t-label mt-1 opacity-60">{m.reaction}</p>
              </div>
              <CollectButton item={collectMaterial(m)} compact />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
