"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { chapters } from "@/content/world";
import { products } from "@/content/products";
import { useUI } from "@/lib/store";
import { cn, toneOf } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { useScroll } from "@/components/providers/SmoothScroll";
import { Waveform } from "@/components/sound/Waveform";
import { Plate } from "@/components/media/Plate";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SplitReveal } from "@/components/type";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Each chapter has its own light, type, palette and "sound". */
const look = [
  { bg: "#060606", fg: "#e7e2d7", wave: "#e7e2d7" },
  { bg: "#191b1c", fg: "#d7dcdf", wave: "#9fb4bf" },
  { bg: "#1d0e09", fg: "#f0d9cc", wave: "#d0643c" },
  { bg: "#e4cfa9", fg: "#1a130b", wave: "#6b4020" },
  { bg: "#eeebe4", fg: "#121211", wave: "#121211" },
  { bg: "#0b0b0a", fg: "#e7e2d7", wave: "#c7aa74" },
];

/**
 * 02 — ORIGIN. Six immersive scenes on one scroll. Every chapter leaves a
 * fragment behind; the fragments accumulate in the corner and, in the last
 * scene, assemble into the VELOR mark. You literally collect the story.
 */
export function OriginJourney() {
  const wrap = useRef<HTMLElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const setSub = useUI((s) => s.setSub);
  const { scrollTo } = useScroll();
  const n = chapters.length;

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress * n;
        const i = Math.min(n - 1, Math.floor(p));
        const local = Math.min(1, p - i);
        stick.current?.style.setProperty("--lp", local.toFixed(4));
        stick.current?.style.setProperty("--p", self.progress.toFixed(4));
        if (counter.current && i === 1) counter.current.textContent = String(Math.round(local * 412)).padStart(3, "0");
        setIndex((prev) => {
          if (prev !== i) pulse.emit({ strength: 0.7, kind: "nav" });
          return i;
        });
      },
    });
    return () => st.kill();
  }, [n]);

  useEffect(() => {
    setSub(`${chapters[index].year} · ${chapters[index].title}`);
  }, [index, setSub]);
  useEffect(() => () => setSub(null), [setSub]);

  // Cursor light for the first chapter.
  useEffect(() => {
    const el = stick.current;
    if (!el) return;
    const on = (e: PointerEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  const jump = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.08) / n);
    scrollTo(top, { duration: 1.6 });
  };

  const c = chapters[index];
  const L = look[index];

  return (
    <>
      <section ref={wrap} className="relative" style={{ height: `${n * 120 + 40}svh` }} aria-label="The story of VELOR">
        <div
          ref={stick}
          data-tone={toneOf(L.bg)}
          className="sticky top-0 h-svh overflow-hidden transition-colors duration-[1400ms] ease-[var(--ease-expo)]"
          style={{ background: L.bg, color: L.fg, ["--lp" as string]: 0, ["--mx" as string]: "50vw", ["--my" as string]: "50vh" } as CSSProperties}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={c.id}
              className="absolute inset-y-0 left-0 right-0 md:left-[7.5rem]"
              initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Scene i={index} />
            </motion.div>
          </AnimatePresence>

          {/* Chapter heading — consistent position, changing typography */}
          <div className="pointer-events-none absolute left-[var(--gutter)] top-[5.5rem] z-10">
            <AnimatePresence mode="wait">
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: EASE }}>
                <p className="t-label opacity-60">
                  Chapter {c.n} — {c.year}
                </p>
                <p className={cn("mt-2", index === 2 ? "t-condensed text-4xl" : index === 3 ? "t-serif text-4xl italic" : "t-display text-3xl")}>{c.title}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Year rail */}
          <nav aria-label="Chapters" className="absolute left-[var(--gutter)] top-1/2 z-10 hidden -translate-y-1/2 md:block">
            <ol className="flex flex-col gap-3">
              {chapters.map((ch, i) => (
                <li key={ch.id}>
                  <button type="button" onClick={() => jump(i)} data-cursor={ch.year} className="group flex items-center gap-3">
                    <span className={cn("block h-px bg-current transition-all duration-700", i === index ? "w-10 opacity-100" : "w-4 opacity-30 group-hover:w-6")} />
                    <span className={cn("t-label transition-opacity", i === index ? "opacity-100" : "opacity-35")}>{ch.year}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* Collected fragments → the mark */}
          <Fragments index={index} />

          {/* The chapter's sound */}
          <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-14 z-10 flex items-end justify-between gap-6">
            <div className="h-10 w-full max-w-[26rem]" style={{ color: L.wave }}>
              <Waveform {...c.wave} layers={3} />
            </div>
            <p className="t-label hidden shrink-0 opacity-50 md:block">
              {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
          </div>

          <div
            className={cn(
              "pointer-events-none absolute right-[var(--gutter)] top-[5.5rem] z-10 text-right transition-opacity duration-700",
              index === 1 ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          >
            <p className="t-label opacity-60">Prototype</p>
            <p className="t-condensed text-7xl tabular-nums">
              P-<span ref={counter}>000</span>
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-ink px-[var(--gutter)] py-[22vh] text-bone" data-tone="dark">
        <p className="t-label mb-6 opacity-60">End of the story — for now</p>
        <SplitReveal as="h2" text="The question never left the fridge." className="t-serif size-xl max-w-[16ch] italic" />
        <div className="mt-16 flex flex-wrap gap-4">
          <TransitionLink href="/objects" className="t-label bg-bone px-6 py-4 text-ink" data-cursor="Enter">
            See what it became — Objects →
          </TransitionLink>
          <TransitionLink href="/archive" className="t-label border border-bone/30 px-6 py-4" data-cursor="Enter">
            Open the archive
          </TransitionLink>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────── Scenes ───────────────────────── */

function Scene({ i }: { i: number }) {
  const c = chapters[i];
  switch (i) {
    case 0:
      return (
        <div className="absolute inset-0 grid place-items-center px-[var(--gutter)]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle 32vmax at var(--mx) var(--my), rgba(231,226,215,0.13), transparent 70%)" }}
          />
          <div className="relative text-center">
            <p className="t-serif size-xl mx-auto max-w-[14ch] italic">
              {c.line}
              <span className="caret ml-1 inline-block h-[0.8em] w-[2px] translate-y-[0.1em] bg-current align-baseline" />
            </p>
            <p className="t-body mx-auto mt-10 max-w-[34ch] opacity-55">{c.text}</p>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="absolute inset-0 grid grid-cols-1 items-center gap-8 px-[var(--gutter)] pt-24 md:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="t-condensed size-xl max-w-[12ch] uppercase">{c.line}</p>
            <p className="t-body mt-6 max-w-[40ch] opacity-60">{c.text}</p>
            <div className="t-label mt-8 grid max-w-[22rem] grid-cols-2 gap-y-2 opacity-70">
              <span>Light</span>
              <span>North window</span>
              <span>Table</span>
              <span>Oak, 1 of 1</span>
              <span>Variable</span>
              <span>The idea</span>
            </div>
          </div>
          <div className="grid grid-cols-[repeat(21,minmax(0,1fr))] gap-[3px] md:gap-1" aria-label="412 prototypes">
            {Array.from({ length: 412 }, (_, k) => (
              <span
                key={k}
                className={cn("aspect-square", k === 310 ? "bg-[#d0643c]" : "bg-current")}
                style={{ ["--i" as string]: k, opacity: `clamp(0.08, calc(var(--lp) * 440 - var(--i)), ${k === 310 ? 1 : 0.85})` } as CSSProperties}
              />
            ))}
          </div>
        </div>
      );
    case 2:
      return (
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path
              d="M-2 38 L14 42 L22 36 L31 49 L40 44 L48 58 L57 51 L63 63 L72 57 L81 70 L90 64 L102 72"
              fill="none"
              stroke="#d0643c"
              strokeWidth="0.22"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: "calc(1 - min(1, var(--lp) * 2.2))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col justify-center px-[var(--gutter)]">
            <p className="t-condensed t-outline select-none text-[clamp(10rem,42vw,40rem)] leading-[0.8]" style={{ animation: "flicker 3.2s infinite" }}>
              411
            </p>
            <p className="t-condensed size-lg -mt-[2vw] max-w-[18ch] uppercase">{c.line}</p>
            <p className="t-body mt-6 max-w-[42ch] opacity-60">{c.text}</p>
          </div>
          {Array.from({ length: 14 }, (_, k) => (
            <span
              key={k}
              className="absolute top-[-4vh] block bg-[#d0643c]/60"
              style={{
                left: `${6 + k * 6.6}%`,
                width: 4 + (k % 4) * 3,
                height: 4 + ((k * 7) % 5) * 3,
                animation: `fall ${3 + (k % 5)}s linear ${k * 0.37}s infinite`,
              }}
            />
          ))}
          <style>{`@keyframes fall { to { transform: translate3d(${"0"}, 112vh, 0) rotate(260deg) } }`}</style>
        </div>
      );
    case 3:
      return (
        <div className="absolute inset-0 grid grid-cols-1 items-center gap-10 px-[var(--gutter)] pt-24 md:grid-cols-[1.2fr_1fr]">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[40vmax] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,246,226,0.95), rgba(255,236,200,0.3) 45%, transparent 70%)",
              transform: "translate(-50%, -50%) scale(calc(0.5 + var(--lp) * 1.4))",
            }}
          />
          <p className="t-serif relative size-huge max-w-[10ch] italic">{c.line}</p>
          <figure className="relative mx-auto w-[min(70vw,24rem)] rotate-2 bg-paper p-3 pb-10 text-ink shadow-[0_30px_80px_rgba(60,30,0,0.35)]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Plate kind="strata" tone="sepia" seed={109} />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 125" aria-hidden>
                <ellipse cx="52" cy="60" rx="30" ry="22" fill="none" stroke="#b3261e" strokeWidth="1.4" transform="rotate(-8 52 60)" />
              </svg>
            </div>
            <figcaption className="t-label absolute inset-x-3 bottom-3 flex justify-between">
              <span>P-311</span>
              <span>07.12.18</span>
            </figcaption>
          </figure>
          <p className="t-body relative max-w-[44ch] opacity-75 md:col-span-2">{c.text}</p>
        </div>
      );
    case 4: {
      const solen = products[0];
      return (
        <div className="absolute inset-0 grid grid-cols-1 items-end gap-8 px-[var(--gutter)] pb-28 pt-24 md:grid-cols-[1.4fr_1fr]">
          <div className="relative mx-auto h-[56vh] w-full max-w-[44rem]">
            <div className="absolute inset-x-[8%] bottom-0 h-[12%] bg-[#dcd8cf]" />
            <div className="absolute inset-x-0 bottom-[12%] top-0">
              <ElevationDrawing product={solen} mode="solid" />
            </div>
          </div>
          <div className="max-w-[24rem] border-t border-current/20 pt-5">
            <p className="t-display text-3xl">SOLEN</p>
            <p className="t-label mt-1 opacity-60">2021 · Table light</p>
            <p className="t-body mt-5 opacity-75">{c.text}</p>
            <p className="t-label mt-6 opacity-60">Concrete · brass · opal glass · 11 parts</p>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="absolute inset-0 grid place-items-center px-[var(--gutter)] text-center">
          <div className="translate-y-[16vh] md:translate-y-[18vh]">
            <p className="t-display size-huge">VELOR</p>
            <p className="t-serif mt-4 text-[clamp(1.5rem,3vw,2.8rem)] italic text-brass">{c.line}</p>
            <p className="t-body mx-auto mt-6 max-w-[46ch] opacity-60">{c.text}</p>
          </div>
        </div>
      );
  }
}

/* ───────────────────────── Fragments ───────────────────────── */

const pieces = [
  <line key="q" x1="100" y1="18" x2="100" y2="182" />,
  <g key="e">
    {Array.from({ length: 25 }, (_, k) => (
      <circle key={k} cx={40 + (k % 5) * 30} cy={40 + Math.floor(k / 5) * 30} r="2.2" fill="currentColor" stroke="none" />
    ))}
  </g>,
  <path key="f" d="M22 70 L58 84 L74 70 L100 104 L126 92 L144 122 L178 132" />,
  <circle key="d" cx="100" cy="100" r="54" />,
  <rect key="o" x="36" y="36" width="128" height="128" />,
];

function Fragments({ index }: { index: number }) {
  const final = index === chapters.length - 1;
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      initial={false}
      animate={
        final
          ? { top: "46%", right: "50%", width: "min(34vmin, 18rem)", x: "50%", y: "-78%" }
          : { top: "calc(100% - 13.5rem)", right: "var(--gutter)", width: "7.5rem", x: "0%", y: "0%" }
      }
      transition={{ duration: 1.4, ease: EASE }}
      style={{ height: "auto" }}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" className="w-full overflow-visible" fill="none" stroke="currentColor" strokeWidth={final ? 1.5 : 2}>
        {pieces.map((p, k) => (
          <motion.g
            key={k}
            initial={false}
            animate={{ opacity: index >= k ? 1 : 0.08, scale: index === k ? [1.25, 1] : 1 }}
            transition={{ duration: 1, ease: EASE }}
            style={{ transformOrigin: "100px 100px" }}
          >
            {p}
          </motion.g>
        ))}
      </svg>
      {!final && (
        <p className="t-label mt-2 text-right opacity-60">
          Fragments {Math.min(index + 1, 5)}/5
        </p>
      )}
    </motion.div>
  );
}
