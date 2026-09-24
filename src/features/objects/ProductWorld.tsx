"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { products } from "@/content/products";
import { getMaterial as getLabMaterial } from "@/content/materials";
import type { Product } from "@/content/types";
import { useUI } from "@/lib/store";
import { cn, toneOf } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { EnvStage } from "./EnvRoom";
import { LazyObjectViewer, type ViewerApi } from "@/components/three/LazyObjectViewer";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";

type Tab = "story" | "variants" | "materials" | "details";
const TABS: Tab[] = ["story", "variants", "materials", "details"];
const EASE = [0.16, 1, 0.3, 1] as const;

export const collectObject = (p: Product) => ({
  id: `object:${p.slug}`,
  kind: "object" as const,
  title: p.name,
  href: `/objects/${p.slug}`,
  meta: `${p.index} — ${p.type}`,
  ref: p.slug,
});

/**
 * 03 — OBJECTS. One huge object at a time. Switching objects rebuilds the
 * room around it; the object can be turned, zoomed, taken apart, x-rayed,
 * re-materialised and compared — then followed into its own story.
 */
export function ProductWorld() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [variants, setVariants] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>("story");
  const [xray, setXray] = useState(false);
  const [explode, setExplode] = useState(false);
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [compare, setCompare] = useState<[number, number]>([0, 1]);
  const api = useRef<ViewerApi | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setFocus = useUI((s) => s.setFocus);
  const setSub = useUI((s) => s.setSub);

  const product = products[index];
  const displayed = products[shown];
  const variant = product.variants[variants[product.slug] ?? 0];

  const go = useCallback(
    (i: number) => {
      const next = (i + products.length) % products.length;
      if (next === index) return;
      setIndex(next);
      setLeaving(true);
      setHotspot(null);
      setExplode(false);
      setXray(false);
      setCompare([0, 1]);
      pulse.emit({ strength: 0.9, kind: "nav" });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setShown(next);
        setLeaving(false);
      }, 420);
    },
    [index],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    setFocus(product.slug);
    setSub(`${product.index} ${product.name}`);
  }, [product, setFocus, setSub]);
  useEffect(() => () => setSub(null), [setSub]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [go, index]);

  const env = product.env;

  return (
    <section
      className="relative min-h-svh overflow-hidden transition-colors duration-[1200ms] md:h-svh"
      style={{ color: env.fg }}
      data-tone={toneOf(env.bg)}
      aria-label="Objects — product world"
    >
      <EnvStage product={product} />

      {/* The name is part of the architecture, behind the object */}
      <div className="pointer-events-none absolute inset-x-0 top-[16svh] flex justify-center overflow-hidden md:top-[22svh]" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={product.slug}
            className="t-display flex whitespace-nowrap text-[clamp(6rem,24vw,26rem)] opacity-[0.13]"
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 0.13 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            {product.name}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The object */}
      <div className="relative h-[66svh] md:absolute md:inset-y-0 md:left-0 md:right-[24rem] md:h-auto xl:right-[20rem]">
        <LazyObjectViewer
          className="h-full w-full"
          product={displayed}
          variant={displayed.variants[variants[displayed.slug] ?? 0]}
          interactive
          autoRotate={!hotspot && tab !== "details"}
          explode={explode ? 1 : 0}
          xray={xray}
          hotspots={tab === "details"}
          activeHotspot={hotspot}
          onHotspot={(id) => setHotspot(id)}
          labels={explode}
          leaving={leaving}
          apiRef={api}
        />
        {/* Controls */}
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center md:bottom-16">
          <div className="flex items-center gap-1 rounded-full border border-current/20 p-1 backdrop-brightness-95">
            <Control env={env} label="Zoom out" onClick={() => api.current?.zoom(-1)}>
              −
            </Control>
            <Control env={env} label="Zoom in" onClick={() => api.current?.zoom(1)}>
              +
            </Control>
            <Control env={env} label="Reset view" onClick={() => api.current?.reset()}>
              ⟲
            </Control>
            <span className="mx-1 h-4 w-px bg-current/25" />
            <Control env={env} label="Disassemble" active={explode} onClick={() => setExplode((v) => !v)} wide>
              {explode ? "Assemble" : "Disassemble"}
            </Control>
            <Control env={env} label="Hidden details" active={xray} onClick={() => setXray((v) => !v)} wide>
              X-ray
            </Control>
          </div>
        </div>
      </div>

      {/* Index — the collection */}
      <nav aria-label="Objects" className="absolute left-[var(--gutter)] top-[5.5rem] z-10">
        <p className="t-label mb-4 opacity-60">03 — Objects / {env.label}</p>
        <ol className="hidden flex-col gap-2 md:flex">
          {products.map((p, i) => (
            <li key={p.slug}>
              <button type="button" onClick={() => go(i)} data-cursor={p.name} className="group flex items-baseline gap-4 text-left">
                <span className="t-label w-6 opacity-60">{p.index}</span>
                <span className={cn("t-display text-2xl transition-all duration-700 ease-[var(--ease-expo)]", i === index ? "opacity-100" : "opacity-35 group-hover:translate-x-1 group-hover:opacity-70")}>
                  {p.name}
                </span>
                <span className={cn("t-label transition-opacity", i === index ? "opacity-60" : "opacity-0")}>{p.type}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3 md:hidden">
          <button type="button" onClick={() => go(index - 1)} className="t-label grid size-10 place-items-center rounded-full border border-current/30" aria-label="Previous object">
            ←
          </button>
          <div>
            <p className="t-display text-3xl leading-none">{product.name}</p>
            <p className="t-label opacity-60">
              {product.index} / {String(products.length).padStart(2, "0")} — {product.type}
            </p>
          </div>
          <button type="button" onClick={() => go(index + 1)} className="t-label grid size-10 place-items-center rounded-full border border-current/30" aria-label="Next object">
            →
          </button>
        </div>
      </nav>

      {/* Panel */}
      <aside className="relative z-10 px-[var(--gutter)] pb-24 pt-6 md:absolute md:bottom-16 md:right-[var(--gutter)] md:top-[5.5rem] md:w-[25rem] md:px-0 md:pb-0 md:pt-0">
        <div className="flex h-full flex-col">
          <div role="tablist" aria-label="Object details" className="flex gap-5 border-b border-current/20 pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  pulse.emit({ strength: 0.2, kind: "tap" });
                }}
                className={cn("t-label relative pb-1 transition-opacity", tab === t ? "opacity-100" : "opacity-45 hover:opacity-80")}
              >
                {t}
                {tab === t && <motion.span layoutId="tab-line" className="absolute -bottom-[13px] left-0 right-0 h-px bg-current" />}
              </button>
            ))}
          </div>

          <div className="relative mt-6 min-h-[16rem] flex-1 md:overflow-y-auto md:pr-2" data-lenis-prevent>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${product.slug}-${tab}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {tab === "story" && (
                  <div className="flex flex-col gap-5">
                    <p className="t-label opacity-60">
                      {product.index} — {product.type} — {product.year}
                    </p>
                    <p className="t-serif text-[2.1rem] italic leading-[1.05]">{product.tagline}</p>
                    <p className="t-body opacity-75">{product.summary}</p>
                    <p className="t-label opacity-60">{product.edition}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <TransitionLink
                        href={`/objects/${product.slug}`}
                        data-cursor="Enter"
                        className="t-label inline-flex items-center gap-3 px-5 py-3 transition-[gap] duration-500 hover:gap-5"
                        style={{ background: env.fg, color: env.bg }}
                      >
                        Enter the object story <span aria-hidden>→</span>
                      </TransitionLink>
                      <CollectButton item={collectObject(product)} compact />
                    </div>
                  </div>
                )}

                {tab === "variants" && (
                  <div className="flex flex-col gap-3">
                    <p className="t-label mb-2 opacity-60">Finish — changes the object, not the room</p>
                    {product.variants.map((v, i) => {
                      const on = (variants[product.slug] ?? 0) === i;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVariants((s) => ({ ...s, [product.slug]: i }));
                            pulse.emit({ strength: 0.35, kind: "tap" });
                          }}
                          aria-pressed={on}
                          className={cn("flex items-center gap-4 border-b border-current/15 py-3 text-left transition-opacity", on ? "opacity-100" : "opacity-55 hover:opacity-90")}
                        >
                          <span className={cn("block size-9 rounded-full border transition-transform duration-500", on ? "scale-110 border-current" : "border-current/20")} style={{ background: v.swatch }} />
                          <span className="t-display text-lg">{v.name}</span>
                          {on && <span className="t-label ml-auto">Selected</span>}
                        </button>
                      );
                    })}
                    <p className="t-body mt-3 text-sm opacity-60">Currently showing: {variant.name}.</p>
                  </div>
                )}

                {tab === "materials" && <MaterialCompare product={product} compare={compare} setCompare={setCompare} />}

                {tab === "details" && (
                  <div className="flex flex-col gap-1">
                    <p className="t-label mb-3 opacity-60">Touch the points on the object — or choose below</p>
                    {product.hotspots.map((h, i) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHotspot(hotspot === h.id ? null : h.id)}
                        aria-expanded={hotspot === h.id}
                        className="border-b border-current/15 py-3 text-left"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="t-label opacity-50">{String(i + 1).padStart(2, "0")}</span>
                          <span className="t-display text-lg">{h.title}</span>
                        </span>
                        <AnimatePresence initial={false}>
                          {hotspot === h.id && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 0.75 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="t-body overflow-hidden pl-8 pt-2 text-sm"
                            >
                              {h.text}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setXray((v) => !v)}
                      aria-pressed={xray}
                      className="t-label mt-5 self-start border border-current/30 px-4 py-2.5 transition-colors hover:border-current"
                    >
                      {xray ? "Hide" : "Reveal"} hidden details
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </aside>

      <p className="t-label pointer-events-none absolute bottom-16 left-1/2 z-10 hidden -translate-x-1/2 translate-y-10 opacity-45 md:block">
        Drag to rotate · scroll to zoom · ← → to change room
      </p>
    </section>
  );
}

function Control({
  children,
  onClick,
  label,
  active,
  wide,
  env,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  wide?: boolean;
  env: Product["env"];
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        pulse.emit({ strength: 0.3, kind: "tap" });
      }}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "t-label grid h-9 place-items-center rounded-full transition-colors duration-300",
        wide ? "px-4" : "w-9 text-base",
        !active && "hover:bg-current/10",
      )}
      style={active ? { background: env.fg, color: env.bg } : undefined}
    >
      {children}
    </button>
  );
}

function MaterialCompare({
  product,
  compare,
  setCompare,
}: {
  product: Product;
  compare: [number, number];
  setCompare: (c: [number, number]) => void;
}) {
  const props = ["density", "warmth", "reflectance", "patina"] as const;
  const [a, b] = [product.materials[compare[0]], product.materials[compare[1]]];
  const pick = (i: number) => {
    if (compare.includes(i)) return;
    setCompare([compare[1], i]);
    pulse.emit({ strength: 0.25, kind: "tap" });
  };
  return (
    <div>
      <p className="t-label mb-3 opacity-60">Choose two materials to compare</p>
      <div className="grid grid-cols-2 gap-2">
        {product.materials.map((m, i) => (
          <button
            key={m.name}
            type="button"
            onClick={() => pick(i)}
            aria-pressed={compare.includes(i)}
            className={cn("border px-3 py-2 text-left transition-colors", compare.includes(i) ? "border-current" : "border-current/15 opacity-60 hover:opacity-100")}
          >
            <span className="t-display block text-sm">{m.name}</span>
            <span className="t-label opacity-60">{m.role}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {props.map((k) => (
          <div key={k}>
            <div className="t-label mb-1.5 flex justify-between opacity-70">
              <span>{a.name}</span>
              <span>{k}</span>
              <span>{b.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex h-1.5 justify-end bg-current/10">
                <motion.span className="block h-full bg-current" initial={false} animate={{ width: `${a.props[k] * 100}%` }} transition={{ duration: 0.9, ease: EASE }} />
              </div>
              <div className="h-1.5 bg-current/10">
                <motion.span className="block h-full bg-current/60" initial={false} animate={{ width: `${b.props[k] * 100}%` }} transition={{ duration: 0.9, ease: EASE }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        {[a, b].map((m) => (
          <TransitionLink key={m.name} href={`/materials/${m.lab}`} className="t-label border-b border-current/40 pb-0.5" data-cursor="Lab">
            {getLabMaterial(m.lab)?.name} in the lab →
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
