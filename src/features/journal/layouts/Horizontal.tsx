"use client";

import { useRef } from "react";
import type { HorizontalArticle } from "@/content/journal";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/hooks";
import { Plate } from "@/components/media/Plate";
import { SplitReveal } from "@/components/type";

/** Three architectural plans, drawn — thresholds as floor plans. */
function PlanDrawing({ n }: { n: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={`hatch-${n}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
      {n === 1 && (
        <>
          <path d="M20 130 H150 V70 H380 V250 H150 V170 H20" {...common} />
          <rect x="20" y="118" width="130" height="12" fill={`url(#hatch-1)`} />
          <rect x="20" y="170" width="130" height="12" fill={`url(#hatch-1)`} />
          <path d="M30 150 H300" {...common} strokeDasharray="4 4" />
          <path d="M290 142 L300 150 L290 158" {...common} />
          <text x="40" y="112" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">H 2.10 m</text>
          <text x="200" y="100" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">H 6.40 m</text>
        </>
      )}
      {n === 2 && (
        <>
          <path d="M20 60 H260 V240 H320" {...common} />
          <path d="M20 110 H210 V240" {...common} />
          <path d="M320 180 V290 H390 V180 Z" {...common} />
          <path d="M40 85 H235 V230 H300" {...common} strokeDasharray="4 4" />
          <circle cx="355" cy="235" r="6" fill="var(--color-brass)" />
          <text x="40" y="50" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">THE DESTINATION IS HIDDEN</text>
        </>
      )}
      {n === 3 && (
        <>
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <rect x={20 + k * 74} y="60" width="70" height="180" {...common} />
              <rect x={20 + k * 74 + 66} y="138" width="12" height="24" fill="currentColor" opacity={k < 4 ? 1 : 0} />
            </g>
          ))}
          <path d="M30 150 H385" {...common} strokeDasharray="2 5" />
          <text x="30" y="50" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">SIGHTLINE — 5 ROOMS</text>
        </>
      )}
    </svg>
  );
}

/** ARCHITECTURE — read sideways: a sequence of thresholds, pinned and panned. */
export function HorizontalLayout({ a }: { a: HorizontalArticle }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: section.current, pin: true, scrub: 0.8, end: () => `+=${distance()}`, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="bg-bone text-ink" data-tone="light">
      <header className="grid min-h-[86svh] grid-cols-1 content-end gap-8 px-[var(--gutter)] pb-14 pt-32 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="t-label opacity-60">
            {a.category} — {a.author} — {a.date}
          </p>
          <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-display mt-4 text-[clamp(3.2rem,9vw,10rem)]" />
        </div>
        <p className="t-body self-end opacity-75 md:col-span-4">{a.intro}</p>
      </header>

      <section ref={section} className="relative md:h-svh md:overflow-hidden" aria-label="Six thresholds">
        <div ref={track} className="flex flex-col gap-10 px-[var(--gutter)] pb-20 md:h-full md:w-max md:flex-row md:items-center md:gap-0 md:pb-0">
          {a.plates.map((p, k) => (
            <figure key={p.title} className="flex shrink-0 flex-col gap-4 md:h-[74vh] md:w-[52vw] md:pr-[4vw] lg:w-[40vw]">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-ink/10 md:aspect-auto md:flex-1">
                {p.plate ? (
                  <Plate {...p.plate} />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-paper p-6">
                    <PlanDrawing n={p.plan ?? 1} />
                  </div>
                )}
                <span className="t-label absolute left-3 top-3 bg-bone/90 px-2 py-1">T-0{k + 1}</span>
              </div>
              <figcaption className="grid grid-cols-[auto_1fr] gap-x-4">
                <span className="t-label opacity-50">0{k + 1}</span>
                <span className="t-display text-2xl">{p.title}</span>
                <span />
                <span className="t-body mt-1 max-w-[40ch] text-[0.95rem] opacity-70">{p.text}</span>
              </figcaption>
            </figure>
          ))}
          <div className="flex shrink-0 items-center md:h-full md:w-[34vw]">
            <p className="t-serif text-[clamp(2rem,4vw,4rem)] italic leading-tight">
              We designed this website the same way: rooms, thresholds, light at the end.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
