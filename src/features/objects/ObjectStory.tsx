"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useScroll as useFMScroll, useTransform } from "framer-motion";
import type { MaterialUse, PartGroup, Product, TextureKind } from "@/content/types";
import { products } from "@/content/products";
import { getMaterial as getLabMaterial } from "@/content/materials";
import { ScrollTrigger } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { cn, toneOf } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { useScroll } from "@/components/providers/SmoothScroll";
import { EnvRoom, EnvStage } from "./EnvRoom";
import { collectObject } from "./ProductWorld";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { MaterialTexture } from "@/components/media/MaterialTexture";
import { LazyObjectViewer, type ViewerApi } from "@/components/three/LazyObjectViewer";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";
import { Rise, SectionMark, SplitReveal } from "@/components/type";

const EASE = [0.16, 1, 0.3, 1] as const;

const GROUPS: { id: PartGroup; title: string }[] = [
  { id: "internal", title: "Internal details" },
  { id: "material", title: "Materials" },
  { id: "structure", title: "Construction" },
  { id: "mechanism", title: "Mechanics" },
  { id: "texture", title: "Textures" },
];

function textureFor(m: MaterialUse): TextureKind {
  const n = m.name.toLowerCase();
  if (/brass|bronze/.test(n)) return "brass";
  if (/concrete/.test(n)) return "concrete";
  if (/felt|wool/.test(n)) return "wool";
  if (/leather/.test(n)) return "fabric";
  if (/glass|borosilicate|opal/.test(n)) return "glass";
  if (/oak|cork/.test(n)) return "wood";
  if (/steel/.test(n)) return "steel";
  if (/travertine|stone/.test(n)) return "travertine";
  return "composite";
}

/**
 * 05 — OBJECT STORY. Every object gets its own long-form page:
 * opening, reason, making, matter, anatomy, details, dimensions, idea —
 * and finally a viewer you can step inside.
 */
export function ObjectStory({ slug }: { slug: string }) {
  const product = products.find((p) => p.slug === slug)!;
  const setFocus = useUI((s) => s.setFocus);
  const setSub = useUI((s) => s.setSub);

  useEffect(() => {
    setFocus(product.slug);
    setSub(product.name);
    return () => setSub(null);
  }, [product, setFocus, setSub]);

  const i = products.indexOf(product);
  const next = products[(i + 1) % products.length];

  return (
    <article
      style={{ ["--env-bg" as string]: product.env.bg, ["--env-fg" as string]: product.env.fg } as CSSProperties}
      aria-label={`${product.name} — object story`}
    >
      <Opener product={product} />
      <Why product={product} />
      <Shaping product={product} />
      <Materials product={product} />
      <Anatomy product={product} />
      <Details product={product} />
      <Dimensions product={product} />
      <Idea product={product} />
      <EnterTheObject product={product} />
      <NextObject next={next} />
    </article>
  );
}

/* 01 — THE OBJECT */
function Opener({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useFMScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  return (
    <section ref={ref} className="relative h-svh overflow-hidden" style={{ color: product.env.fg }} data-tone={toneOf(product.env.bg)}>
      <EnvRoom env={product.env} />
      <motion.div style={{ y: nameY }} className="absolute inset-x-0 top-[15svh] flex justify-center">
        <SplitReveal as="h1" by="char" text={product.name} immediate stagger={0.06} delay={0.3} className="t-display size-mega" />
      </motion.div>
      <motion.div
        style={{ y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
        className="absolute inset-x-0 bottom-[9svh] top-[34svh] mx-auto w-[min(86vw,46rem)]"
      >
        <ElevationDrawing product={product} mode="solid" />
      </motion.div>
      <div className="absolute inset-x-[var(--gutter)] bottom-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Object", product.index],
          ["Type", product.type],
          ["Year", String(product.year)],
          ["Edition", product.edition],
        ].map(([k, v]) => (
          <div key={k} className="border-t border-current/25 pt-2">
            <p className="t-label opacity-55">{k}</p>
            <p className="t-label mt-1">{v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 02 — WHY IT EXISTS */
function Why({ product }: { product: Product }) {
  return (
    <section className="bg-ink px-[var(--gutter)] py-[18vh] text-bone" data-tone="dark">
      <SectionMark n="02" title="Why it exists" />
      <div className="mt-14 grid gap-12 md:grid-cols-12">
        <SplitReveal as="h2" text={product.tagline} className="t-serif size-xl italic md:col-span-7" />
        <div className="t-body flex flex-col gap-6 text-bone/75 md:col-span-4 md:col-start-9 md:pt-4">
          {product.why.map((p, k) => (
            <Rise key={k} delay={k * 0.1}>
              <p>{p}</p>
            </Rise>
          ))}
          <Rise delay={0.3}>
            <p className="t-label border-l border-brass pl-4 text-brass">The brief: {product.idea.line}</p>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* 03 — HOW IT WAS SHAPED */
function Shaping({ product }: { product: Product }) {
  const [step, setStep] = useState(0);
  const s = product.shaping[step];
  return (
    <section className="bg-paper px-[var(--gutter)] py-[16vh] text-ink" data-tone="light">
      <SectionMark n="03" title="How it was shaped" />
      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.35fr]">
        <div className="flex flex-col">
          <SplitReveal as="h2" text="From a gesture to an anatomy." className="t-display size-lg max-w-[14ch]" />
          <ol className="mt-10 flex flex-col">
            {product.shaping.map((st, k) => (
              <li key={st.title} className="border-t border-ink/15">
                <button
                  type="button"
                  onClick={() => {
                    setStep(k);
                    pulse.emit({ strength: 0.3, kind: "tap" });
                  }}
                  aria-expanded={k === step}
                  className="flex w-full items-baseline gap-4 py-4 text-left"
                >
                  <span className="t-label opacity-50">0{k + 1}</span>
                  <span className={cn("t-display text-2xl transition-opacity", k === step ? "opacity-100" : "opacity-35")}>{st.title}</span>
                </button>
                <AnimatePresence initial={false}>
                  {k === step && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 0.75 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="t-body overflow-hidden pb-5 pl-10"
                    >
                      {st.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ol>
          <label className="mt-8 flex flex-col gap-3">
            <span className="t-label opacity-60">Drag to shape the object</span>
            <input
              type="range"
              min={0}
              max={product.shaping.length - 1}
              step={1}
              value={step}
              onChange={(e) => {
                setStep(Number(e.target.value));
                pulse.emit({ strength: 0.2, kind: "tap" });
              }}
              className="w-full accent-[#121211]"
              data-cursor="Drag"
            />
          </label>
        </div>
        <div
          className="relative aspect-square overflow-hidden bg-[#e7e3d9]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="absolute inset-[8%] text-[#2a2824]"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <ElevationDrawing
                product={product}
                mode={s.stage === "sketch" ? "sketch" : s.stage === "line" ? "line" : "solid"}
                dims={s.stage === "line"}
                explode={s.stage === "explode" ? 1 : 0}
                draw={s.stage === "sketch" || s.stage === "line"}
              />
            </motion.div>
          </AnimatePresence>
          <p className="t-label absolute left-4 top-4 opacity-60">
            Stage 0{step + 1} — {s.title}
          </p>
          <p className="t-label absolute bottom-4 right-4 opacity-60">DWG {product.index}</p>
        </div>
      </div>
    </section>
  );
}

/* 04 — MATERIAL */
function Materials({ product }: { product: Product }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-carbon px-[var(--gutter)] py-[16vh] text-bone" data-tone="dark">
      <SectionMark n="04" title="Material" />
      <SplitReveal as="h2" text="Four temperatures, one object." className="t-display size-lg mt-10 max-w-[18ch]" />
      <div className="mt-12 flex flex-col gap-2 md:h-[64vh] md:flex-row">
        {product.materials.map((m, k) => {
          const lab = getLabMaterial(m.lab);
          const on = open === k;
          return (
            <div
              key={m.name}
              role="button"
              tabIndex={0}
              data-cursor="Examine"
              onMouseEnter={() => setOpen(k)}
              onFocus={() => setOpen(k)}
              onClick={() => setOpen(k)}
              onKeyDown={(e) => e.key === "Enter" && setOpen(k)}
              className={cn(
                "relative overflow-hidden transition-[flex-grow,height] duration-[900ms] ease-[var(--ease-velor)] outline-none",
                on ? "h-[60vh] md:h-auto md:flex-[4]" : "h-20 md:h-auto md:flex-1",
              )}
            >
              <div className={cn("absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-expo)]", on ? "scale-100" : "scale-125")}>
                <MaterialTexture kind={textureFor(m)} seed={k + 3} />
              </div>
              <div className={cn("absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-700", on ? "opacity-100" : "opacity-60")} />
              <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
                <p className="t-label opacity-70">{m.role}</p>
                <p className={cn("t-display leading-none transition-[font-size] duration-700", on ? "text-4xl" : "text-lg")}>{m.name}</p>
                <AnimatePresence>
                  {on && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="flex flex-col gap-3">
                      <div className="grid max-w-md grid-cols-4 gap-3">
                        {(["density", "warmth", "reflectance", "patina"] as const).map((key) => (
                          <div key={key}>
                            <p className="t-label mb-1 text-[0.6rem] opacity-60">{key}</p>
                            <div className="h-1 bg-bone/20">
                              <div className="h-full bg-bone" style={{ width: `${m.props[key] * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {lab && (
                        <TransitionLink href={`/materials/${lab.slug}`} className="t-label self-start border-b border-bone/50 pb-0.5" data-cursor="Lab">
                          Specimen {lab.code} in the Material Lab →
                        </TransitionLink>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* 05 — ANATOMY (scroll to disassemble) */
function Anatomy({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const explodeRef = useRef(0);
  const [group, setGroup] = useState(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const e = Math.min(1, Math.max(0, (self.progress - 0.08) / 0.55));
        explodeRef.current = e;
        if (bar.current) bar.current.style.transform = `scaleX(${e})`;
        const g = Math.min(GROUPS.length - 1, Math.floor(Math.max(0, self.progress - 0.2) * 1.25 * GROUPS.length));
        setGroup(g);
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={ref} className="relative h-[360svh]" style={{ color: product.env.fg }} data-tone={toneOf(product.env.bg)}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <EnvRoom env={product.env} />
        <LazyObjectViewer className="absolute inset-0" product={product} explodeRef={explodeRef} labels autoRotate />
        <div className="pointer-events-none absolute left-[var(--gutter)] top-[5.5rem] max-w-[22rem]">
          <SectionMark n="05" title="Anatomy" />
          <p className="t-display size-lg mt-6">Take it apart.</p>
          <p className="t-body mt-4 opacity-70">Keep scrolling. Every part comes out without tools — and every part can come back.</p>
        </div>
        <ol className="absolute bottom-24 right-[var(--gutter)] hidden w-[20rem] flex-col gap-1 md:flex">
          {GROUPS.map((g, k) => {
            const parts = product.parts.filter((p) => p.group === g.id);
            if (!parts.length) return null;
            return (
              <li key={g.id} className={cn("border-t border-current/20 py-2 transition-opacity duration-500", k === group ? "opacity-100" : "opacity-35")}>
                <p className="t-label flex justify-between">
                  <span>{g.title}</span>
                  <span className="opacity-60">{String(parts.length).padStart(2, "0")}</span>
                </p>
                <AnimatePresence initial={false}>
                  {k === group && (
                    <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      {parts.map((p) => (
                        <li key={p.id} className="pt-2 text-sm leading-snug opacity-80">
                          <span className="font-medium">{p.label}</span> — {p.note}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
        <div className="absolute bottom-10 left-[var(--gutter)] flex items-center gap-3">
          <span className="t-label opacity-60">Disassembly</span>
          <span className="block h-px w-40 bg-current/25">
            <span ref={bar} className="block h-full origin-left bg-current" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      </div>
    </section>
  );
}

/* 06 — DETAILS */
function Details({ product }: { product: Product }) {
  const [active, setActive] = useState(product.hotspots[0].id);
  const h = product.hotspots.find((x) => x.id === active)!;
  const idx = product.hotspots.indexOf(h);
  return (
    <section className="bg-ink px-[var(--gutter)] py-[16vh] text-bone" data-tone="dark">
      <SectionMark n="06" title="Details" />
      <div className="mt-12 grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-square w-full">
          <ElevationDrawing
            product={product}
            mode="solid"
            markers={product.hotspots.map((x) => ({ id: x.id, part: x.part, label: x.title }))}
            activeMarker={active}
            onMarker={(id) => {
              setActive(id);
              pulse.emit({ strength: 0.4, kind: "tap" });
            }}
            highlight={h.part}
          />
        </div>
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6, ease: EASE }}>
              <p className="t-label opacity-60">
                Detail {String(idx + 1).padStart(2, "0")} / {String(product.hotspots.length).padStart(2, "0")}
              </p>
              <p className="t-display size-lg mt-3">{h.title}</p>
              <p className="t-body mt-5 max-w-[36ch] text-bone/75">{h.text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-10 flex flex-wrap gap-2">
            {product.hotspots.map((x, k) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setActive(x.id)}
                aria-pressed={x.id === active}
                className={cn("t-label border px-3 py-2 transition-colors", x.id === active ? "border-bone bg-bone text-ink" : "border-bone/25 hover:border-bone")}
              >
                0{k + 1} {x.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* 07 — DIMENSIONS */
function Dimensions({ product }: { product: Product }) {
  return (
    <section className="bg-paper px-[var(--gutter)] py-[16vh] text-ink" data-tone="light">
      <SectionMark n="07" title="Dimensions" />
      <div className="mt-12 grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[4/5] w-full border border-ink/10 p-6 md:aspect-square">
          <ElevationDrawing product={product} mode="line" dims draw xray />
          <p className="t-label absolute left-4 top-4 opacity-50">Front elevation · 1:4</p>
        </div>
        <div>
          <p className="t-display size-lg">
            {product.dims.w} × {product.dims.h} × {product.dims.d}
            <span className="t-label ml-3 align-middle opacity-60">mm</span>
          </p>
          <dl className="mt-10 grid grid-cols-1 border-t border-ink/15">
            {[...product.specs, { label: "Weight", value: product.weight }].map((s) => (
              <div key={s.label} className="grid grid-cols-[10rem_1fr] gap-4 border-b border-ink/15 py-3">
                <dt className="t-label opacity-55">{s.label}</dt>
                <dd className="text-[0.95rem]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* 08 — THE IDEA */
function Idea({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const words = product.idea.line.split(" ");
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => stick.current?.style.setProperty("--p", self.progress.toFixed(4)),
    });
    return () => st.kill();
  }, []);
  return (
    <section ref={ref} className="relative h-[220svh] bg-ink text-bone" data-tone="dark">
      <div ref={stick} className="sticky top-0 flex h-svh flex-col justify-center px-[var(--gutter)]" style={{ ["--p" as string]: 0 } as CSSProperties}>
        <SectionMark n="08" title="The idea" className="mb-10" />
        <p className="t-serif size-huge max-w-[16ch] italic">
          {words.map((w, k) => (
            <span
              key={k}
              className="inline-block transition-opacity duration-300"
              style={{ opacity: `clamp(0.1, calc(var(--p) * ${words.length * 1.5} - ${k}), 1)` }}
            >
              {w}&nbsp;
            </span>
          ))}
        </p>
        <p className="t-body mt-10 max-w-[48ch] text-bone/70" style={{ opacity: "clamp(0, calc(var(--p) * 3 - 1.8), 1)" }}>
          {product.idea.body}
        </p>
      </div>
    </section>
  );
}

/* 09 — ENTER THE OBJECT */
function EnterTheObject({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { lenis } = useScroll();
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <section className="relative h-svh overflow-hidden" style={{ color: product.env.fg }} data-tone={toneOf(product.env.bg)}>
      <EnvRoom env={product.env} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-[var(--gutter)] text-center">
        <SectionMark n="09" title="Enter the object" />
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            pulse.emit({ strength: 1, kind: "nav" });
          }}
          data-cursor="Enter"
          className="group relative grid aspect-square w-[min(64vw,22rem)] place-items-center rounded-full border border-current/40"
        >
          <span className="absolute inset-0 rounded-full border border-current/30" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <span className="t-display text-3xl transition-transform duration-700 group-hover:scale-110">Step inside</span>
        </button>
        <div className="flex flex-wrap justify-center gap-3">
          <CollectButton item={collectObject(product)} />
        </div>
      </div>
      <AnimatePresence>{open && <Immersive product={product} onClose={() => setOpen(false)} />}</AnimatePresence>
    </section>
  );
}

function Immersive({ product, onClose }: { product: Product; onClose: () => void }) {
  const [variant, setVariant] = useState(0);
  const [explode, setExplode] = useState(0);
  const [xray, setXray] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const api = useRef<ViewerApi | null>(null);
  const h = product.hotspots.find((x) => x.id === hot);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label={`${product.name} — immersive viewer`}
      className="fixed inset-0 z-[60]"
      style={{ color: product.env.fg }}
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <EnvStage product={product} />
      <LazyObjectViewer
        className="absolute inset-0"
        product={product}
        variant={product.variants[variant]}
        interactive
        hotspots
        activeHotspot={hot}
        onHotspot={setHot}
        explode={explode}
        xray={xray}
        labels={explode > 0.4}
        apiRef={api}
        distance={0.9}
      />
      <div className="absolute left-[var(--gutter)] top-[5.5rem]">
        <p className="t-label opacity-60">Inside {product.name}</p>
        <p className="t-display mt-1 text-4xl">{product.name}</p>
      </div>
      <button type="button" onClick={onClose} className="t-label absolute right-[var(--gutter)] top-[5.5rem] border border-current/40 px-4 py-2" data-cursor="Leave">
        Leave ✕
      </button>

      <AnimatePresence>
        {h && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-[var(--gutter)] top-1/3 w-[min(80vw,20rem)] p-4"
            style={{ background: product.env.fg, color: product.env.bg }}
          >
            <p className="t-label opacity-70">Detail</p>
            <p className="t-display mt-1 text-xl">{h.title}</p>
            <p className="mt-2 text-sm leading-snug opacity-80">{h.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-[var(--gutter)] bottom-16 flex flex-wrap items-end justify-between gap-6">
        <div className="flex gap-2">
          {product.variants.map((v, k) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(k)}
              aria-label={v.name}
              aria-pressed={k === variant}
              className={cn("size-8 rounded-full border transition-transform", k === variant ? "scale-110 border-current" : "border-current/20")}
              style={{ background: v.swatch }}
            />
          ))}
        </div>
        <label className="flex min-w-[14rem] flex-1 flex-col gap-2 md:max-w-sm">
          <span className="t-label opacity-70">Disassemble — {Math.round(explode * 100)}%</span>
          <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} className="w-full" style={{ accentColor: product.env.fg }} />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => api.current?.zoom(-1)} className="t-label size-9 rounded-full border border-current/30" aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => api.current?.zoom(1)} className="t-label size-9 rounded-full border border-current/30" aria-label="Zoom in">
            +
          </button>
          <button
            type="button"
            onClick={() => setXray((v) => !v)}
            aria-pressed={xray}
            className="t-label rounded-full border border-current/30 px-4"
            style={xray ? { background: product.env.fg, color: product.env.bg } : undefined}
          >
            X-ray
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NextObject({ next }: { next: Product }) {
  return (
    <TransitionLink href={`/objects/${next.slug}`} data-cursor="Next" className="group relative block h-[70svh] overflow-hidden" style={{ color: next.env.fg }} data-tone={toneOf(next.env.bg)}>
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-105">
        <EnvRoom env={next.env} />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end px-[var(--gutter)] pb-20">
        <p className="t-label opacity-60">
          Next object — {next.index} / {next.type}
        </p>
        <p className="t-display size-mega leading-[0.8]">{next.name}</p>
      </div>
    </TransitionLink>
  );
}
