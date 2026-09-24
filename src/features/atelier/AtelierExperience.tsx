"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { stages, type AtelierStage } from "@/content/world";
import { products } from "@/content/products";
import { useUI } from "@/lib/store";
import { cn, toneOf } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { useIsoLayoutEffect } from "@/hooks";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { MaterialTexture } from "@/components/media/MaterialTexture";
import { Plate } from "@/components/media/Plate";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SplitReveal } from "@/components/type";

type Mode = "process" | "material" | "people";
const MODES: Mode[] = ["process", "material", "people"];
const EASE = [0.16, 1, 0.3, 1] as const;

const palette: Record<Mode, { bg: string; fg: string; line: string }> = {
  process: { bg: "#e8e4da", fg: "#1c1b18", line: "rgba(28,27,24,0.14)" },
  material: { bg: "#0f0f0e", fg: "#e7e2d7", line: "rgba(231,226,215,0.14)" },
  people: { bg: "#c8b79c", fg: "#251b12", line: "rgba(37,27,18,0.16)" },
};

/**
 * 04 — ATELIER. Six rooms of the workshop on one horizontal bench.
 * The same stages can be read three ways — as drawings, as matter,
 * or as the people who did the work — and the whole interface
 * transforms to match.
 */
export function AtelierExperience() {
  const [mode, setMode] = useState<Mode>("process");
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const setSub = useUI((s) => s.setSub);
  const P = palette[mode];

  useEffect(() => {
    setSub(`${mode.toUpperCase()} · ${stages[active].title}`);
  }, [mode, active, setSub]);
  useEffect(() => () => setSub(null), [setSub]);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          pin: true,
          scrub: 0.8,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            const i = Math.min(stages.length - 1, Math.round(self.progress * (stages.length - 1)));
            setActive((prev) => (prev === i ? prev : i));
          },
        },
      });
    });
    mm.add("(max-width: 767px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-stage]", section.current);
      panels.forEach((p, i) =>
        gsap.timeline({
          scrollTrigger: {
            trigger: p,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => self.isActive && setActive(i),
          },
        }),
      );
    });
    return () => mm.revert();
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    pulse.emit({ strength: 0.8, kind: "nav" });
  };

  return (
    <div className="transition-colors duration-[1200ms] ease-[var(--ease-expo)]" style={{ background: P.bg, color: P.fg }} data-tone={toneOf(P.bg)}>
      {/* Intro */}
      <header className="relative flex min-h-[78svh] flex-col justify-end px-[var(--gutter)] pb-16 pt-32">
        <p className="t-label mb-4 opacity-60">04 — Atelier / How it&apos;s made</p>
        <SplitReveal as="h1" text="ATELIER" by="char" immediate delay={0.2} className="t-display size-mega" />
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="t-body max-w-[46ch] opacity-75">
            Forty weeks between a question and an object. Walk the bench from research to the final piece — and choose how to see it: as drawings, as matter, or as
            the people whose hands it passed through.
          </p>
          <p className="t-label opacity-60">Switch the view above — the whole atelier changes with it</p>
        </div>
      </header>

      {/* The bench */}
      <section ref={section} className="relative md:h-svh md:overflow-hidden" aria-label="The making of an object">
        <div ref={track} className="flex flex-col md:h-full md:w-max md:flex-row">
          {stages.map((s, i) => (
            <StagePanel key={s.id} stage={s} i={i} mode={mode} line={P.line} />
          ))}
          <div className="flex min-h-[60svh] flex-col justify-center gap-8 px-[var(--gutter)] md:h-full md:w-[70vw] md:shrink-0">
            <p className="t-label opacity-60">After week 40</p>
            <p className="t-display size-xl max-w-[12ch]">It leaves the atelier signed.</p>
            <div className="flex flex-wrap gap-3">
              <TransitionLink href="/materials" className="t-label px-6 py-4" style={{ background: P.fg, color: P.bg }} data-cursor="Enter">
                Enter the Material Lab →
              </TransitionLink>
              <TransitionLink href="/objects" className="t-label border px-6 py-4" style={{ borderColor: P.line }} data-cursor="Enter">
                Back to the objects
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* Flow bar */}
        <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-14 hidden md:block">
          <ol className="flex justify-between">
            {stages.map((s, i) => (
              <li key={s.id} className={cn("t-label flex items-center gap-2 transition-opacity duration-500", i === active ? "opacity-100" : "opacity-40")}>
                <span className={cn("block size-1.5 rounded-full border border-current", i <= active && "bg-current")} />
                {s.title}
                {i < stages.length - 1 && <span className="ml-2 opacity-40">→</span>}
              </li>
            ))}
          </ol>
          <span className="mt-3 block h-px w-full" style={{ background: P.line }}>
            <span ref={bar} className="block h-full origin-left bg-current" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      </section>

      {/* The lens — always within reach */}
      <div className="fixed inset-x-0 bottom-14 z-40 flex justify-center md:bottom-auto md:top-[4.4rem]">
        <ModeSwitch mode={mode} onChange={choose} compact />
      </div>
    </div>
  );
}

function ModeSwitch({ mode, onChange, compact }: { mode: Mode; onChange: (m: Mode) => void; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label="View the atelier as" className={cn("flex rounded-full border border-current/25 p-1", compact && "shadow-[0_10px_40px_rgba(0,0,0,0.18)]")} style={compact ? { background: palette[mode].bg } : undefined}>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          data-cursor={m}
          className="t-label relative px-4 py-2.5 md:px-6"
        >
          {mode === m && <motion.span layoutId={compact ? "mode-pill-m" : "mode-pill"} className="absolute inset-0 rounded-full bg-current" transition={{ duration: 0.6, ease: EASE }} />}
          <span className="relative transition-colors duration-500" style={{ color: mode === m ? palette[mode].bg : undefined }}>
            {m}
          </span>
        </button>
      ))}
    </div>
  );
}

function StagePanel({ stage, i, mode, line }: { stage: AtelierStage; i: number; mode: Mode; line: string }) {
  return (
    <article
      data-stage
      className="relative flex min-h-svh shrink-0 flex-col border-t px-[var(--gutter)] pb-28 pt-24 md:h-full md:min-h-0 md:w-[86vw] md:border-l md:border-t-0 lg:w-[74vw]"
      style={{ borderColor: line }}
      aria-label={`${stage.n} ${stage.title}`}
    >
      <header className="relative z-10 flex items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span className="t-label opacity-60">{stage.n}/06</span>
          <h2 className="t-display text-[clamp(2.2rem,5vw,5rem)]">{stage.title}</h2>
        </div>
        <span className="t-label opacity-60">{stage.weeks}</span>
      </header>

      <div className="relative mt-8 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            className="absolute inset-0"
            initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.04 }}
          >
            {mode === "process" && <ProcessView stage={stage} />}
            {mode === "material" && <MaterialView stage={stage} />}
            {mode === "people" && <PeopleView stage={stage} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </article>
  );
}

/* ───────── PROCESS — drawings and prototypes ───────── */

function ProcessView({ stage }: { stage: AtelierStage }) {
  const solen = products[0];
  const fig = stage.process.figure;
  return (
    <div className="grid h-full grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr]">
      <div className="relative min-h-[42svh] overflow-hidden border border-current/15">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.06,
          }}
        />
        {fig === "board" && (
          <div className="absolute inset-6 grid grid-cols-3 grid-rows-2 gap-4">
            {[
              { k: "window", t: "sand", n: "Light at 21:00" },
              { k: "portrait", t: "night", n: "212 hands, 4 switches" },
              { k: "columns", t: "bone", n: "Rhythm, not repetition" },
              { k: "shaft", t: "dusk", n: "One surface lit" },
              { k: "studio", t: "bone", n: "Weight on a table" },
              { k: "stairs", t: "sepia", n: "Steps you can count" },
            ].map((r, k) => (
              <figure key={k} className={cn("relative overflow-hidden bg-paper p-1.5 shadow-md", k % 2 ? "rotate-1" : "-rotate-1")}>
                <div className="h-[78%] overflow-hidden">
                  <Plate kind={r.k as never} tone={r.t as never} seed={500 + k} />
                </div>
                <figcaption className="t-serif mt-1 truncate text-sm italic">{r.n}</figcaption>
                <span className="absolute left-1/2 top-1 size-2.5 -translate-x-1/2 rounded-full bg-rust shadow" />
              </figure>
            ))}
          </div>
        )}
        {fig === "sketch" && (
          <div className="absolute inset-8">
            <ElevationDrawing product={solen} mode="sketch" draw />
          </div>
        )}
        {fig === "blocks" && <Blocks />}
        {fig === "chips" && (
          <div className="absolute inset-6 grid grid-cols-3 gap-3">
            {(["concrete", "brass", "glass", "wool", "travertine", "wood", "steel", "plaster", "composite"] as const).map((t, k) => (
              <div key={t} className="relative overflow-hidden">
                <MaterialTexture kind={t} seed={k + 20} />
                <span className="t-label absolute bottom-1 left-1 bg-paper/85 px-1 text-[0.58rem] text-ink">
                  S-{String(k + 101)} {t}
                </span>
                {k === 0 && <span className="t-label absolute right-1 top-1 bg-ink px-1 text-[0.58rem] text-bone">Chosen</span>}
              </div>
            ))}
          </div>
        )}
        {fig === "drawing" && (
          <div className="absolute inset-8 grid grid-cols-[1.4fr_1fr] gap-6">
            <ElevationDrawing product={solen} mode="line" dims draw xray />
            <div className="opacity-70">
              <ElevationDrawing product={solen} mode="line" explode={1} draw />
            </div>
          </div>
        )}
        {fig === "final" && (
          <div className="absolute inset-8 flex flex-col">
            <div className="flex-1">
              <ElevationDrawing product={solen} mode="solid" />
            </div>
            <p className="t-serif mt-4 text-right text-2xl italic">No. 001 / 300 — A.S.</p>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-end gap-6">
        <p className="t-serif text-[clamp(1.6rem,2.4vw,2.4rem)] italic leading-tight">{stage.process.text}</p>
        <p className="t-label opacity-60">Process — sheet {stage.n}</p>
      </div>
    </div>
  );
}

function Blocks() {
  const blocks = [
    { x: 8, y: 52, w: 16, h: 30, v: "v1", x2: true },
    { x: 30, y: 44, w: 12, h: 38, v: "v2", x2: true },
    { x: 48, y: 30, w: 10, h: 52, v: "v3" },
    { x: 64, y: 38, w: 14, h: 44, v: "v4", x2: true },
    { x: 82, y: 24, w: 10, h: 58, v: "v7", keep: true },
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <line x1="2" x2="98" y1="82" y2="82" stroke="currentColor" strokeWidth="0.3" />
      {blocks.map((b) => (
        <g key={b.v}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.keep ? "currentColor" : "none"} fillOpacity={b.keep ? 0.12 : 0} stroke="currentColor" strokeWidth="0.35" />
          <ellipse cx={b.x + b.w / 2} cy={b.y} rx={b.w / 2} ry="1.6" fill="none" stroke="currentColor" strokeWidth="0.3" />
          {b.x2 && <path d={`M${b.x} ${b.y} L${b.x + b.w} ${b.y + b.h} M${b.x + b.w} ${b.y} L${b.x} ${b.y + b.h}`} stroke="#8f4a31" strokeWidth="0.4" />}
          <text x={b.x + b.w / 2} y="90" textAnchor="middle" fontSize="3" fill="currentColor" fontFamily="var(--font-mono)">
            {b.v}
          </text>
        </g>
      ))}
      <text x="87" y="18" textAnchor="middle" fontSize="3.4" fill="#8f4a31" fontFamily="var(--font-serif)" fontStyle="italic">
        this one.
      </text>
    </svg>
  );
}

/* ───────── MATERIAL — macro textures ───────── */

function MaterialView({ stage }: { stage: AtelierStage }) {
  return (
    <div className="relative h-full min-h-[60svh] overflow-hidden">
      <motion.div className="absolute inset-0" initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }}>
        <MaterialTexture kind={stage.material.texture} seed={stage.n.length * 7 + Number(stage.n)} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-bone">
        <p className="t-display text-[clamp(2rem,6vw,6rem)] leading-none">{stage.material.texture.toUpperCase()}</p>
        <p className="t-label max-w-[20rem] text-right opacity-80">{stage.material.caption}</p>
      </div>
      <svg className="pointer-events-none absolute right-6 top-6 size-24 text-bone" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
        <text x="50" y="66" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">
          MACRO
        </text>
      </svg>
    </div>
  );
}

/* ───────── PEOPLE — short stories ───────── */

function PeopleView({ stage }: { stage: AtelierStage }) {
  const p = stage.person;
  return (
    <div className="grid h-full grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.4fr]">
      <figure className="relative min-h-[40svh] overflow-hidden">
        <Plate kind="portrait" tone="sand" seed={p.seed} />
        <figcaption className="t-label absolute bottom-3 left-3 bg-paper/90 px-2 py-1 text-ink">
          {p.name} — {p.role}
        </figcaption>
      </figure>
      <div className="flex flex-col justify-between gap-8">
        <p className="t-serif text-[clamp(2rem,4.4vw,4.6rem)] italic leading-[1.02]">&ldquo;{p.quote}&rdquo;</p>
        <div className="max-w-[40ch]">
          <p className="t-display text-2xl">{p.name}</p>
          <p className="t-label mt-1 opacity-60">{p.role}</p>
          <p className="t-body mt-4 opacity-80">{p.story}</p>
        </div>
      </div>
    </div>
  );
}
