"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unbuilt, years, type ArchiveItem, type ArchiveYear } from "@/content/archive";
import { getProduct } from "@/content/products";
import { useUI } from "@/lib/store";
import { cn, rng, toneOf } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { useIsTouch } from "@/hooks";
import { Plate } from "@/components/media/Plate";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";
import { SectionMark, SplitReveal } from "@/components/type";

const EASE = [0.16, 1, 0.3, 1] as const;

export const collectProject = (item: ArchiveItem, year: number) => ({
  id: `project:${item.id}`,
  kind: "project" as const,
  title: item.title,
  href: "/archive",
  meta: `${item.code} — ${item.type} — ${year}`,
  ref: item.id,
});

export function ArchiveVisual({ item, filter }: { item: ArchiveItem; filter?: string }) {
  const product = item.drawing ? getProduct(item.drawing) : undefined;
  return (
    <div className="absolute inset-0" style={{ filter }}>
      {product ? (
        <div className="absolute inset-0 grid place-items-center bg-[#f3efe6] p-[10%] text-[#2a2824]">
          <ElevationDrawing product={product} mode="sketch" />
        </div>
      ) : item.plate ? (
        <Plate {...item.plate} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[#efe9dc] p-4 text-center text-[#2a2824]">
          <p className="t-serif text-2xl italic line-through decoration-[#8f4a31] decoration-2">{item.title}</p>
        </div>
      )}
    </div>
  );
}

/** Deterministic scatter of prints on the table (percent positions + tilt). */
function scatter(n: number, seed: number) {
  const r = rng(seed);
  const cols = 3;
  return Array.from({ length: n }, (_, i) => ({
    x: 4 + (i % cols) * 31 + r() * 8,
    y: 4 + Math.floor(i / cols) * 44 + r() * 10,
    rot: (r() - 0.5) * 9,
  }));
}

/**
 * 07 — ARCHIVE. Five years laid out like prints on a table. Choosing a
 * year changes the whole interface — its paper, its ink, its photographic
 * process — and ends with the ideas we chose not to build.
 */
export function ArchiveExperience() {
  const [yi, setYi] = useState(years.length - 1);
  const [open, setOpen] = useState<ArchiveItem | null>(null);
  const setSub = useUI((s) => s.setSub);
  const y = years[yi];
  const E = y.era;
  const table = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSub(`${y.year} · ${E.label}`);
  }, [y, E, setSub]);
  useEffect(() => () => setSub(null), [setSub]);

  const choose = (i: number) => {
    setYi(i);
    setOpen(null);
    pulse.emit({ strength: 0.9, kind: "nav" });
  };

  return (
    <div className="transition-colors duration-[1200ms] ease-[var(--ease-expo)]" style={{ background: E.bg, color: E.fg }} data-tone={toneOf(E.bg)}>
      <header className="px-[var(--gutter)] pb-8 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-label opacity-60">07 — Archive / {E.label}</p>
            <SplitReveal as="h1" text="ARCHIVE" by="char" immediate delay={0.2} className="t-display size-huge" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={y.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: EASE }} className="max-w-[26rem] md:text-right">
              <p className="t-serif text-3xl italic">{y.title}</p>
              <p className="t-body mt-2 opacity-70">{y.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <nav aria-label="Years" className="no-scrollbar mt-10 overflow-x-auto border-y py-2" style={{ borderColor: `${E.muted}55` }}>
          <ol className="flex min-w-max items-baseline justify-between gap-6">
            {years.map((yr, i) => (
              <li key={yr.year}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  aria-pressed={i === yi}
                  data-cursor={String(yr.year)}
                  className={cn("t-display text-[clamp(3rem,9vw,9rem)] leading-none transition-all duration-700", i === yi ? "opacity-100" : "t-outline opacity-40 hover:opacity-80")}
                >
                  {yr.year}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* The table */}
      <section aria-label={`Archive ${y.year}`} className="px-[var(--gutter)] pb-[10vh]">
        <p className="t-label mb-6 flex justify-between opacity-70">
          <span>
            {y.items.length} records — concepts, prototypes, sketches, photographs, rejections
          </span>
          <span className="hidden md:inline">Drag the prints · click to open</span>
        </p>
        <div ref={table} className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 md:block md:h-[118vh]">
          <AnimatePresence mode="popLayout">
            {y.items.map((item, i) => (
              <Print key={`${y.year}-${item.id}`} item={item} i={i} y={y} table={table} onOpen={() => setOpen(item)} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <Unbuilt era={y} />

      <section className="px-[var(--gutter)] pb-[16vh] pt-[6vh]">
        <TransitionLink href="/future" data-cursor="Future" className="group block border-t pt-8" style={{ borderColor: `${E.muted}55` }}>
          <p className="t-label opacity-60">Some ideas didn&apos;t die. They moved.</p>
          <p className="t-display mt-3 text-[clamp(3rem,10vw,10rem)] leading-[0.85] transition-transform duration-700 group-hover:translate-x-4">FUTURE →</p>
        </TransitionLink>
      </section>

      <AnimatePresence>{open && <Detail item={open} year={y} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function Print({ item, i, y, table, onOpen }: { item: ArchiveItem; i: number; y: ArchiveYear; table: React.RefObject<HTMLDivElement | null>; onOpen: () => void }) {
  const touch = useIsTouch();
  const pos = scatter(y.items.length, y.year)[i];
  const dragged = useRef(false);
  const E = y.era;
  return (
    <motion.div
      drag={!touch}
      dragConstraints={table}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={() => setTimeout(() => (dragged.current = false), 50)}
      whileDrag={{ scale: 1.04, zIndex: 20, rotate: 0 }}
      initial={{ opacity: 0, y: -120, rotate: pos.rot * 3 }}
      animate={{ opacity: 1, y: 0, rotate: pos.rot }}
      exit={{ opacity: 0, y: 160, rotate: pos.rot * -2, transition: { duration: 0.5, delay: i * 0.03 } }}
      transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.07 }}
      className="relative md:absolute md:w-[27%]"
    >
      <button
        type="button"
        onClick={() => !dragged.current && onOpen()}
        data-cursor={touch ? undefined : "Open"}
        className="group block w-full p-2.5 pb-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:cursor-grab"
        style={{ background: E.paper, color: E.fg }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ArchiveVisual item={item} filter={E.filter} />
          <span className="t-label absolute left-2 top-2 px-1.5 py-0.5 text-[0.6rem]" style={{ background: E.paper }}>
            {item.type}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="t-display text-lg leading-tight">{item.title}</span>
          <span className="t-label shrink-0 text-[0.6rem] opacity-60">{item.code}</span>
        </div>
        <p className="t-label mt-1 text-[0.6rem] opacity-60">Status: {item.status}</p>
      </button>
      <PositionStyle id={item.id} x={pos.x} y={pos.y} />
    </motion.div>
  );
}

/** Desktop-only absolute placement, applied via a scoped rule so mobile keeps flow layout. */
function PositionStyle({ id, x, y }: { id: string; x: number; y: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      el.style.left = mq.matches ? `${x}%` : "";
      el.style.top = mq.matches ? `${y}%` : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [x, y, id]);
  return <span ref={ref} hidden />;
}

function Detail({ item, year, onClose }: { item: ArchiveItem; year: ArchiveYear; onClose: () => void }) {
  const E = year.era;
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <>
      <motion.div className="fixed inset-0 z-[55] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal
        aria-label={item.title}
        className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[34rem] flex-col overflow-y-auto p-6 pt-24"
        style={{ background: E.paper, color: E.fg }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        data-lenis-prevent
      >
        <button type="button" onClick={onClose} className="t-label self-end">
          Close ✕
        </button>
        <div className="relative mt-6 aspect-[4/3] overflow-hidden">
          <ArchiveVisual item={item} filter={E.filter} />
        </div>
        <p className="t-label mt-6 opacity-60">
          {item.code} · {item.type} · {year.year}
        </p>
        <h2 className="t-display mt-2 text-4xl">{item.title}</h2>
        <p className="t-body mt-4 opacity-80">{item.text}</p>
        <p className="t-label mt-6">Status — {item.status}</p>
        <div className="mt-8">
          <CollectButton item={collectProject(item, year.year)} />
        </div>
      </motion.aside>
    </>
  );
}

/* THE IDEAS WE DIDN'T BUILD */
function Unbuilt({ era }: { era: ArchiveYear }) {
  const [hover, setHover] = useState<string | null>(null);
  const floater = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();
  const E = era.era;

  useEffect(() => {
    const el = floater.current;
    if (!el || touch) return;
    gsap.set(el, { xPercent: -50, yPercent: -60 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const on = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [touch]);

  const current = unbuilt.find((u) => u.id === hover);

  return (
    <section className="px-[var(--gutter)] py-[14vh]" aria-label="The ideas we didn't build">
      <SectionMark n="∅" title="The ideas we didn't build" />
      <SplitReveal as="h2" text="THE IDEAS WE DIDN'T BUILD" className="t-display size-xl mt-8 max-w-[14ch]" />
      <p className="t-body mt-6 max-w-[48ch] opacity-70">Every object we made stands on a pile of objects we didn&apos;t. These are the ones we still talk about.</p>
      <ol className="mt-12">
        {unbuilt.map((u, k) => (
          <li key={u.id} className="border-t" style={{ borderColor: `${E.muted}55` }} onMouseEnter={() => setHover(u.id)} onMouseLeave={() => setHover(null)}>
            <div className="grid gap-4 py-6 md:grid-cols-12 md:items-baseline">
              <span className="t-label opacity-50 md:col-span-1">
                {String(k + 1).padStart(2, "0")} · {u.year}
              </span>
              <span className="relative md:col-span-5">
                <span className="t-display text-[clamp(1.8rem,3.4vw,3.4rem)] leading-none">{u.name}</span>
                <motion.span
                  className="absolute left-0 top-1/2 block h-[3px] w-full origin-left bg-rust"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                />
              </span>
              <span className="t-body opacity-75 md:col-span-4">{u.reason}</span>
              <span className="flex flex-col items-start gap-3 md:col-span-2 md:items-end">
                <span className="t-label">{u.lesson}</span>
                <CollectButton item={{ id: `idea:${u.id}`, kind: "idea", title: u.name, href: "/archive", meta: `Unbuilt — ${u.year}`, ref: u.id }} compact />
              </span>
            </div>
          </li>
        ))}
      </ol>
      {!touch && (
        <div ref={floater} className="pointer-events-none fixed left-0 top-0 z-30 h-[28vh] w-[22vh]" aria-hidden>
          <AnimatePresence>
            {current && (
              <motion.div
                key={current.id}
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ filter: "sepia(0.8) contrast(1.1)" }}
              >
                <Plate {...current.plate} />
                <span className="absolute inset-x-0 top-1/2 h-[3px] -rotate-12 bg-rust" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
