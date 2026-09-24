"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { materials } from "@/content/materials";
import { getProduct } from "@/content/products";
import type { LabMaterial, StructurePattern } from "@/content/types";
import { useUI } from "@/lib/store";
import { cn, rng, toneOf } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { Specimen } from "./Specimen";
import { collectMaterial } from "./MaterialLab";
import { MaterialTexture } from "@/components/media/MaterialTexture";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";
import { Rise, SectionMark, SplitReveal } from "@/components/type";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A material's own scene: source, structure, tactility, application. */
export function MaterialScene({ slug }: { slug: string }) {
  const m = materials.find((x) => x.slug === slug)!;
  const i = materials.indexOf(m);
  const next = materials[(i + 1) % materials.length];
  const setSub = useUI((s) => s.setSub);
  useEffect(() => {
    setSub(`${m.code} ${m.name}`);
    return () => setSub(null);
  }, [m, setSub]);

  return (
    <div style={{ background: m.tone.bg, color: m.tone.fg }} data-tone={toneOf(m.tone.bg)}>
      {/* Hero — the specimen, full scale */}
      <section className="relative h-svh overflow-hidden">
        <Specimen slug={m.slug} hero className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[var(--gutter)] pb-16 pt-28 text-bone mix-blend-difference">
          <p className="t-label">
            Specimen {m.code} — {m.spec}
          </p>
          <div>
            <SplitReveal as="h1" text={m.name} by="char" immediate delay={0.2} className="t-display size-mega" />
            <p className="t-label mt-4">{m.reaction} — touch it</p>
          </div>
        </div>
      </section>

      <Source m={m} />
      <Structure m={m} />
      <Tactility m={m} />
      <Application m={m} />

      <footer className="grid gap-10 border-t border-current/15 px-[var(--gutter)] py-[14vh] md:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <p className="t-label opacity-60">Keep this specimen</p>
          <CollectButton item={collectMaterial(m)} />
          <TransitionLink href="/materials" className="t-label border-b border-current/40 pb-0.5" data-cursor="Lab">
            ← Back to the bench
          </TransitionLink>
        </div>
        <TransitionLink href={`/materials/${next.slug}`} data-cursor="Next" className="group relative block h-[40vh] overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-105">
            <MaterialTexture kind={next.texture} />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-bone">
            <p className="t-label opacity-80">Next specimen — {next.code}</p>
            <p className="t-display size-lg">{next.name}</p>
          </div>
        </TransitionLink>
      </footer>
    </div>
  );
}

/* SOURCE */
function Source({ m }: { m: LabMaterial }) {
  const contours = useMemo(() => {
    const r = rng(m.code.charCodeAt(0) * 13 + m.code.charCodeAt(2));
    const phases = Array.from({ length: 4 }, () => r() * Math.PI * 2);
    return Array.from({ length: 11 }, (_, k) => {
      const base = 26 + k * 17;
      const pts = Array.from({ length: 73 }, (_, j) => {
        const a = (j / 72) * Math.PI * 2;
        const rr = base + Math.sin(a * 2 + phases[0]) * (6 + k) + Math.sin(a * 3 + phases[1]) * (4 + k * 0.6) + Math.cos(a * 5 + phases[2]) * 3;
        return `${(200 + Math.cos(a) * rr * 1.2).toFixed(1)},${(200 + Math.sin(a) * rr).toFixed(1)}`;
      });
      return `M${pts.join(" L")} Z`;
    });
  }, [m]);

  return (
    <section className="grid gap-12 px-[var(--gutter)] py-[16vh] md:grid-cols-[1fr_1.1fr]">
      <div>
        <SectionMark n="01" title="Source" />
        <SplitReveal as="h2" text={m.source.place} className="t-display size-lg mt-10 max-w-[16ch]" />
        <p className="t-label mt-4 opacity-60">{m.source.coords}</p>
        <Rise>
          <p className="t-body mt-8 max-w-[44ch] opacity-80">{m.source.text}</p>
        </Rise>
      </div>
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 400 400" className="h-full w-full is-drawn" aria-label={`Contour map around ${m.source.place}`} role="img">
          {contours.map((d, k) => (
            <path key={k} d={d} fill="none" stroke="currentColor" strokeWidth={k % 4 === 0 ? 1.2 : 0.6} opacity={0.2 + (k % 4 === 0 ? 0.35 : 0.1)} vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeOpacity="0.15" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeOpacity="0.15" />
          <circle cx="200" cy="200" r="5" fill={m.tone.accent} />
          <circle cx="200" cy="200" r="14" fill="none" stroke={m.tone.accent}>
            <animate attributeName="r" values="6;26;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="214" y="192" fontSize="9" letterSpacing="1.5" fill="currentColor" fontFamily="var(--font-mono)">
            {m.code} SOURCE
          </text>
        </svg>
      </div>
    </section>
  );
}

/* STRUCTURE — step through the scales */
function Structure({ m }: { m: LabMaterial }) {
  const [level, setLevel] = useState(0);
  const s = m.structure[level];
  return (
    <section className="px-[var(--gutter)] py-[16vh]" style={{ background: "rgba(0,0,0,0.12)" }}>
      <SectionMark n="02" title="Structure" />
      <div className="mt-10 grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-square w-full overflow-hidden bg-black/20">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={level}
              className="absolute inset-0"
              initial={{ scale: 0.35, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 3.2, opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Pattern m={m} pattern={s.pattern} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0">
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.3" />
              <line x1="50" y1="2" x2="50" y2="10" stroke="currentColor" strokeWidth="0.3" />
              <line x1="50" y1="90" x2="50" y2="98" stroke="currentColor" strokeWidth="0.3" />
            </svg>
          </div>
          <p className="t-label absolute left-4 top-4">{s.mag}</p>
        </div>
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="t-label opacity-60">Magnification</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Magnification">
              {m.structure.map((lv, k) => (
                <button
                  key={lv.mag}
                  type="button"
                  role="radio"
                  aria-checked={k === level}
                  onClick={() => {
                    setLevel(k);
                    pulse.emit({ strength: 0.5, kind: "tap" });
                  }}
                  data-cursor="Zoom"
                  className={cn("t-label border px-4 py-2.5 transition-colors", k === level ? "border-current bg-current/10" : "border-current/20 opacity-60 hover:opacity-100")}
                >
                  {lv.mag}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={level} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}>
              <p className="t-display size-lg">{s.title}</p>
              <p className="t-body mt-5 max-w-[40ch] opacity-80">{s.text}</p>
            </motion.div>
          </AnimatePresence>
          <input
            type="range"
            min={0}
            max={m.structure.length - 1}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            aria-label="Zoom level"
            className="w-full"
            style={{ accentColor: m.tone.accent }}
          />
        </div>
      </div>
    </section>
  );
}

function Pattern({ m, pattern }: { m: LabMaterial; pattern: StructurePattern }) {
  // A fresh, seeded generator per render keeps the pattern identical across re-renders.
  const r = rng(m.slug.length * 97 + pattern.length);
  const accent = m.tone.accent;

  if (pattern === "texture") return <MaterialTexture kind={m.texture} seed={3} />;

  if (pattern === "cells") {
    const cells = [];
    const s = 46;
    for (let j = -1; j < 11; j++) {
      for (let i = -1; i < 11; i++) {
        const cx = i * s + (j % 2 ? s / 2 : 0) + (r() - 0.5) * 14;
        const cy = j * s * 0.86 + (r() - 0.5) * 14;
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          const rr = s * 0.56 + (r() - 0.5) * 8;
          return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
        });
        cells.push(<polygon key={`${i}-${j}`} points={pts.join(" ")} fill="currentColor" fillOpacity={0.04 + r() * 0.16} stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.8" />);
      }
    }
    return (
      <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        {cells}
      </svg>
    );
  }

  if (pattern === "lattice") {
    const n = 9;
    const g = 440 / (n - 1);
    return (
      <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        {Array.from({ length: n }, (_, j) =>
          Array.from({ length: n }, (_, i) => {
            const x = i * g + (m.slug === "glass" ? (r() - 0.5) * 30 : 0);
            const y = j * g + (m.slug === "glass" ? (r() - 0.5) * 30 : 0);
            return (
              <g key={`${i}-${j}`} style={{ animation: `lattice ${2 + r() * 2}s ease-in-out ${r()}s infinite alternate` }}>
                {i < n - 1 && <line x1={x} y1={y} x2={x + g} y2={y} stroke="currentColor" strokeOpacity="0.3" />}
                {j < n - 1 && <line x1={x} y1={y} x2={x} y2={y + g} stroke="currentColor" strokeOpacity="0.3" />}
                <circle cx={x} cy={y} r={(i + j) % 3 === 0 ? 9 : 5} fill={(i + j) % 3 === 0 ? accent : "currentColor"} />
              </g>
            );
          }),
        )}
        <style>{`@keyframes lattice { to { transform: translate(1.5px, -1.5px) } }`}</style>
      </svg>
    );
  }

  if (pattern === "orbit") {
    return (
      <svg viewBox="0 0 440 440" className="h-full w-full" aria-hidden>
        <circle cx="220" cy="220" r="22" fill={accent} />
        <circle cx="220" cy="220" r="44" fill={accent} opacity="0.15" />
        {[0, 60, 120].map((rot, k) => (
          <g key={rot} transform={`rotate(${rot} 220 220)`}>
            <ellipse id={`orb-${k}`} cx="220" cy="220" rx="170" ry="58" fill="none" stroke="currentColor" strokeOpacity="0.45" />
            <circle r="6" fill="currentColor">
              <animateMotion dur={`${3 + k}s`} repeatCount="indefinite" path="M50 220 a170 58 0 1 0 340 0 a170 58 0 1 0 -340 0" />
            </circle>
          </g>
        ))}
      </svg>
    );
  }

  if (pattern === "fibres") {
    return (
      <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        {[0, 45, -45].map((a, layer) => (
          <g key={a} transform={`rotate(${a} 220 220)`} opacity={1 - layer * 0.25}>
            {Array.from({ length: 34 }, (_, k) => {
              const y = -120 + k * 20 + r() * 6;
              return <path key={k} d={`M-200 ${y} C 60 ${y + (r() - 0.5) * 30}, 380 ${y + (r() - 0.5) * 30}, 640 ${y}`} fill="none" stroke={layer === 0 ? accent : "currentColor"} strokeOpacity={0.25 + r() * 0.4} strokeWidth={1 + r() * 2.5} />;
            })}
          </g>
        ))}
      </svg>
    );
  }

  // rings
  return (
    <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      {Array.from({ length: 26 }, (_, k) => {
        const base = 8 + k * 11 + r() * 4;
        const ph = r() * 6;
        const d = Array.from({ length: 61 }, (_, j) => {
          const a = (j / 60) * Math.PI * 2;
          const rr = base + Math.sin(a * 3 + ph) * (2 + k * 0.4) + Math.sin(a * 7 + ph) * 1.2;
          return `${(160 + Math.cos(a) * rr).toFixed(1)},${(250 + Math.sin(a) * rr * 0.9).toFixed(1)}`;
        });
        return <path key={k} d={`M${d.join(" L")} Z`} fill="none" stroke={k % 5 === 0 ? accent : "currentColor"} strokeOpacity={k % 5 === 0 ? 0.8 : 0.35} strokeWidth={k % 5 === 0 ? 2 : 1} />;
      })}
    </svg>
  );
}

/* TACTILITY */
function Tactility({ m }: { m: LabMaterial }) {
  const t = m.tactility;
  const tap = useRef<() => void>(() => {});
  return (
    <section className="px-[var(--gutter)] py-[16vh]">
      <SectionMark n="03" title="Tactility" />
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Meter label="Temperature to the touch" left="Cold" right="Warm" value={t.temperature} gradient="linear-gradient(90deg,#8fb3c7,#e7e2d7,#d4834f)" />
          <Meter label="Hardness" left="Yields" right="Resists" value={t.hardness} />
          <Meter label="Weight in the hand" left="Light" right="Heavy" value={t.weight} />
          <div className="flex items-baseline justify-between border-t border-current/15 pt-3">
            <span className="t-label opacity-60">Density</span>
            <span className="t-display text-2xl">{t.density}</span>
          </div>
          <p className="t-serif text-[clamp(1.4rem,2.2vw,2rem)] italic leading-snug">{t.text}</p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="t-label opacity-60">Acoustic signature — tap the specimen</p>
          <button
            type="button"
            onClick={() => tap.current()}
            data-cursor="Tap"
            className="relative h-[34vh] w-full overflow-hidden border border-current/20 transition-colors hover:border-current/60"
            aria-label={`Tap ${m.name} — ${t.sound.label}`}
          >
            <div className="absolute inset-0 opacity-30">
              <MaterialTexture kind={m.texture} seed={9} />
            </div>
            <TapWave m={m} triggerRef={tap} />
          </button>
          <p className="t-label flex justify-between opacity-70">
            <span>{t.sound.label}</span>
            <span>
              {t.sound.freq} Hz · decay {t.sound.decay}s
            </span>
          </p>
          <p className="t-label opacity-45">Turn on SOUND in the corner to hear it.</p>
        </div>
      </div>
    </section>
  );
}

function Meter({ label, left, right, value, gradient }: { label: string; left: string; right: string; value: number; gradient?: string }) {
  return (
    <div>
      <p className="t-label mb-3 opacity-60">{label}</p>
      <div className="relative h-2" style={{ background: gradient ?? "rgba(127,127,127,0.25)" }}>
        <motion.span
          className="absolute top-1/2 block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-current bg-[inherit]"
          initial={{ left: "0%" }}
          whileInView={{ left: `${value * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
          style={{ background: "currentColor" }}
        />
      </div>
      <div className="t-label mt-2 flex justify-between opacity-50">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/** A decaying oscillation drawn at the material's pitch — the visible sound of a tap. */
function TapWave({ m, triggerRef }: { m: LabMaterial; triggerRef: React.RefObject<() => void> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let t0 = -10;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const { freq, decay, type } = m.tactility.sound;
    const cycles = Math.min(26, Math.max(2, freq / 110));
    triggerRef.current = () => {
      t0 = performance.now() / 1000;
      pulse.emit({ strength: 1, kind: "tone", freq, decay: Math.min(2, decay) });
    };
    let idle = false;
    const draw = () => {
      const t = performance.now() / 1000 - t0;
      if (t > 6) {
        if (idle) return;
        idle = true;
      } else idle = false;
      const env = Math.exp(-t / Math.max(0.08, decay * 0.6));
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = getComputedStyle(c).color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const u = x / w;
        const ph = u * Math.PI * 2 * cycles - t * 18;
        let v = Math.sin(ph);
        if (type === "square") v = Math.sign(v) * 0.8;
        if (type === "triangle") v = (2 / Math.PI) * Math.asin(Math.sin(ph));
        const y = h / 2 + v * env * (h * 0.4) * Math.exp(-u * (1 / Math.max(0.2, decay)));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
    };
  }, [m, triggerRef]);
  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />;
}

/* APPLICATION */
function Application({ m }: { m: LabMaterial }) {
  return (
    <section className="px-[var(--gutter)] py-[16vh]" style={{ background: "rgba(0,0,0,0.12)" }}>
      <SectionMark n="04" title="Application" />
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <SplitReveal as="h2" text={m.application.text} className="t-serif size-lg italic" />
          <ul className="mt-8 flex flex-col">
            {m.application.uses.map((u, k) => (
              <li key={u} className="flex items-baseline gap-4 border-t border-current/15 py-3">
                <span className="t-label opacity-50">0{k + 1}</span>
                <span className="t-display text-xl">{u}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {m.application.products.map((slug) => {
            const p = getProduct(slug);
            if (!p) return null;
            return (
              <TransitionLink key={slug} href={`/objects/${slug}`} data-cursor="Object" className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden" style={{ background: p.env.bg, color: p.env.fg }}>
                  <div className="absolute inset-[12%] transition-transform duration-1000 ease-[var(--ease-expo)] group-hover:scale-105">
                    <ElevationDrawing product={p} mode="solid" />
                  </div>
                </div>
                <p className="t-display mt-3 text-xl">{p.name}</p>
                <p className="t-label opacity-60">{p.type}</p>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
