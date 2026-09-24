"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { journey, rooms } from "@/content/rooms";
import { useIsMobile, useIsoLayoutEffect, usePointerRef, useReducedMotion } from "@/hooks";
import { Plate } from "@/components/media/Plate";
import { WebGLGate } from "@/components/three/WebGLGate";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SplitReveal } from "@/components/type";

const EntryScene = dynamic(() => import("./EntryScene"), { ssr: false });

const words = (s: string) =>
  s.split(" ").map((w, i, a) => (
    <Fragment key={i}>
      <span className="inline-block overflow-hidden pb-[0.07em] align-bottom">
        <span data-w className="inline-block">
          {w}
        </span>
      </span>
      {i < a.length - 1 ? " " : null}
    </Fragment>
  ));

const disciplines = [
  { n: "01", t: "Industrial design", pos: "left-[var(--gutter)] top-[18%]" },
  { n: "02", t: "Architecture", pos: "right-[var(--gutter)] top-[26%] text-right" },
  { n: "03", t: "Material science", pos: "left-[12%] bottom-[24%]" },
  { n: "04", t: "Culture", pos: "right-[14%] bottom-[18%] text-right" },
];

/**
 * 00 — ENTRY. Not a hero section: a corridor. Scroll physically moves the
 * camera inward; the wordmark splits into the architecture; the corridor
 * ends at seven lit doors that become the world map.
 */
export function HomeExperience() {
  const reduced = useReducedMotion();
  if (reduced) return <HomeStatic />;
  return <HomeCinematic />;
}

function HomeCinematic() {
  const isMobile = useIsMobile();
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = usePointerRef();
  const [ready, setReady] = useState(false);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-letter]",
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.8,
          stagger: 0.08,
          ease: "expo.out",
          delay: 0.25,
          onComplete: () => gsap.set("[data-mask]", { overflow: "visible" }),
        },
      );
      gsap.fromTo("[data-intro]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12, delay: 1, ease: "expo.out" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });

      tl.to(
        "[data-letter]",
        { x: (i: number) => (i - 2) * window.innerWidth * 0.34, scale: 3, autoAlpha: 0, duration: 0.2, ease: "power2.in" },
        0,
      )
        .to("[data-intro-wrap]", { autoAlpha: 0, y: -40, duration: 0.07 }, 0.01)
        .set("[data-s1]", { autoAlpha: 1 }, 0.15)
        .fromTo("[data-s1a] [data-w]", { yPercent: 110 }, { yPercent: 0, duration: 0.08, stagger: 0.012 }, 0.16)
        .fromTo("[data-s1b] [data-w]", { yPercent: 110 }, { yPercent: 0, duration: 0.08, stagger: 0.012 }, 0.27)
        .to("[data-s1]", { autoAlpha: 0, y: -80, duration: 0.07 }, 0.43)
        .fromTo("[data-cross]", { scaleX: 0 }, { scaleX: 1, duration: 0.16 }, 0.5)
        .fromTo("[data-disc]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.045 }, 0.5)
        .to("[data-s2]", { autoAlpha: 0, scale: 1.08, duration: 0.07 }, 0.75)
        .set("[data-s3-title]", { autoAlpha: 1 }, 0.79)
        .fromTo("[data-s3-title] [data-w]", { yPercent: 110 }, { yPercent: 0, duration: 0.06, stagger: 0.01 }, 0.8)
        .fromTo("[data-door]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.012 }, 0.84)
        .fromTo("[data-cta]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.92)
        .to({}, { duration: 0.03 });
    }, wrap);
    return () => ctx.revert();
  }, []);

  // The wordmark leans toward the pointer — the scene reacts before you scroll.
  useEffect(() => {
    const el = wrap.current?.querySelector<HTMLElement>("[data-parallax]");
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" });
    const on = (e: PointerEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * -36);
      yTo((e.clientY / window.innerHeight - 0.5) * -22);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  return (
    <section ref={wrap} className="relative h-[560svh] bg-ink" aria-label="Entry" data-tone="dark">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Scene */}
        <div className="absolute inset-0">
          <div className={cn("absolute inset-0 transition-opacity duration-[1600ms]", ready && "opacity-0")}>
            <Plate kind="arches" tone="night" seed={3} />
          </div>
          <WebGLGate fallback={null}>
            <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-[1600ms]", ready && "opacity-100")}>
              <EntryScene progress={progress} pointer={pointer} lite={isMobile} onReady={() => setReady(true)} />
            </div>
          </WebGLGate>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,11,10,0.75)_100%)]" />
        </div>

        {/* 0 — the wordmark */}
        <div data-parallax className="pointer-events-none absolute inset-0 grid place-items-center">
          <h1 className="t-display size-mega flex select-none text-bone" aria-label="VELOR">
            {"VELOR".split("").map((l, i) => (
              <span key={i} data-mask className="inline-block overflow-hidden pb-[0.04em]" aria-hidden>
                <span data-letter className="inline-block origin-center will-change-transform">
                  {l}
                </span>
              </span>
            ))}
          </h1>
        </div>
        <div data-intro-wrap className="pointer-events-none absolute inset-0">
          <div data-intro className="t-label invisible absolute left-[var(--gutter)] top-[5.5rem] max-w-[14rem] text-bone/70">
            Est. 2022 — An archive of objects, rooms and ideas
          </div>
          <div data-intro className="t-label invisible absolute right-[var(--gutter)] top-[5.5rem] hidden max-w-[16rem] text-right text-bone/70 md:block">
            Industrial design × Architecture × Material science × Culture
          </div>
          <div data-intro className="invisible absolute bottom-[12vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 text-bone">
            <span className="t-label tracking-[0.4em]">Enter the world</span>
            <span className="relative block h-14 w-px overflow-hidden bg-bone/20">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-bone" style={{ animation: "scrollcue 2.2s var(--ease-velor) infinite" }} />
            </span>
          </div>
        </div>

        {/* 1 — the proposition */}
        <div data-s1 className="pointer-events-none invisible absolute inset-0 flex flex-col justify-center gap-[4vh] px-[var(--gutter)] text-bone">
          <p data-s1a className="t-serif size-huge italic">
            {words("Don't visit the brand.")}
          </p>
          <p data-s1b className="t-display size-huge self-end text-right">
            {words("Enter it.")}
          </p>
        </div>

        {/* 2 — the disciplines */}
        <div data-s2 className="pointer-events-none absolute inset-0 text-bone">
          <div className="absolute inset-x-[var(--gutter)] top-1/2 flex -translate-y-1/2 items-center gap-6">
            <span data-cross className="block h-px flex-1 origin-left scale-x-0 bg-bone/40" />
            <span data-disc className="t-serif invisible text-[clamp(1.6rem,3vw,3rem)] italic">
              Objects with a point of view.
            </span>
            <span data-cross className="block h-px flex-1 origin-right scale-x-0 bg-bone/40" />
          </div>
          {disciplines.map((d) => (
            <div key={d.n} data-disc className={cn("invisible absolute", d.pos)}>
              <div className="t-label mb-2 opacity-60">{d.n} ×</div>
              <div className="t-display text-[clamp(1.8rem,5vw,5.5rem)]">{d.t}</div>
            </div>
          ))}
        </div>

        {/* 3 — the threshold */}
        <div className="absolute inset-0 flex flex-col justify-end px-[var(--gutter)] pb-[13vh] text-bone">
          <h2 data-s3-title className="t-display size-xl invisible mb-[5vh] max-w-[12ch]">
            {words("Seven rooms. One world.")}
          </h2>
          <ol className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-bone/20 pt-4 md:grid-cols-7">
            {journey.map((id) => {
              const r = rooms[id];
              return (
                <li key={id} data-door className="invisible">
                  <TransitionLink href={r.href} fromPointer data-cursor="Enter" className="group flex flex-col gap-1">
                    <span className="t-label opacity-50">{r.index}</span>
                    <span className="t-display text-lg transition-transform duration-500 group-hover:-translate-y-1 md:text-xl">{r.name}</span>
                    <span className="t-label hidden opacity-50 md:block">{r.line}</span>
                  </TransitionLink>
                </li>
              );
            })}
          </ol>
          <div data-cta className="invisible mt-8 flex">
            <TransitionLink
              href="/world"
              variant="dolly"
              data-cursor="Enter"
              className="group inline-flex items-center gap-4 bg-bone px-6 py-4 text-ink transition-[gap] duration-500 hover:gap-8"
            >
              <span className="t-label">Open the map of the world</span>
              <span aria-hidden>→</span>
            </TransitionLink>
          </div>
        </div>
      </div>
      <style>{`@keyframes scrollcue { 0% { transform: translateY(-100%) } 60%,100% { transform: translateY(200%) } }`}</style>
    </section>
  );
}

/** Reduced-motion entry: the same story, told as still rooms. */
function HomeStatic() {
  return (
    <div className="bg-ink text-bone" data-tone="dark">
      <section className="relative grid min-h-svh place-items-center overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <Plate kind="arches" tone="night" seed={3} />
        </div>
        <div className="relative text-center">
          <h1 className="t-display size-mega">VELOR</h1>
          <p className="t-label mt-6 tracking-[0.4em]">Enter the world</p>
        </div>
      </section>
      <section className="px-[var(--gutter)] py-[20vh]">
        <p className="t-serif size-huge italic">Don&apos;t visit the brand.</p>
        <p className="t-display size-huge text-right">Enter it.</p>
      </section>
      <section className="px-[var(--gutter)] pb-[20vh]">
        <SplitReveal as="h2" text="Seven rooms. One world." className="t-display size-xl mb-10" />
        <ol className="grid grid-cols-2 gap-6 md:grid-cols-7">
          {journey.map((id) => (
            <li key={id}>
              <TransitionLink href={rooms[id].href} className="flex flex-col gap-1">
                <span className="t-label opacity-50">{rooms[id].index}</span>
                <span className="t-display text-xl">{rooms[id].name}</span>
              </TransitionLink>
            </li>
          ))}
        </ol>
        <TransitionLink href="/world" className="t-label mt-12 inline-block bg-bone px-6 py-4 text-ink">
          Open the map of the world →
        </TransitionLink>
      </section>
    </div>
  );
}
