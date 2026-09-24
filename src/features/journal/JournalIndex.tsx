"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { articles, categories, issue, type Article, type JournalCategory } from "@/content/journal";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { useIsTouch } from "@/hooks";
import { Plate } from "@/components/media/Plate";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Marquee, SplitReveal } from "@/components/type";

export const collectArticle = (a: Article) => ({
  id: `article:${a.slug}`,
  kind: "article" as const,
  title: a.title,
  href: `/journal/${a.slug}`,
  meta: `${a.category} — ${a.author}`,
  ref: a.slug,
});

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 06 — JOURNAL. A premium digital magazine: masthead, issue, a cover story
 * and a contents page where every entry is set differently.
 */
export function JournalIndex() {
  const [cat, setCat] = useState<JournalCategory | "All">("All");
  const [preview, setPreview] = useState<Article | null>(null);
  const floater = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();

  const list = cat === "All" ? articles : articles.filter((a) => a.category === cat);
  const [cover, ...rest] = list;

  // A preview image trails the pointer over text-only entries.
  useEffect(() => {
    const el = floater.current;
    if (!el || touch) return;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const on = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [touch]);

  return (
    <div className="bg-paper text-ink" data-tone="light">
      {/* Masthead */}
      <header className="px-[var(--gutter)] pb-10 pt-28">
        <div className="t-label flex flex-wrap justify-between gap-3 border-b border-ink pb-3">
          <span>Issue {issue.number}</span>
          <span>{issue.season}</span>
          <span>{issue.theme}</span>
          <span className="hidden md:inline">Published by VELOR — Objects with a point of view</span>
        </div>
        <div className="flex items-end justify-between gap-6 overflow-hidden py-4">
          <SplitReveal as="h1" text="VELOR JOURNAL" immediate delay={0.2} stagger={0.08} className="t-display text-[clamp(3.2rem,13.2vw,15rem)] leading-[0.8]" />
        </div>
        <div className="t-label flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-3">
          <span className="t-serif text-xl normal-case italic tracking-normal">Interviews, essays, and visual stories from the edges of design.</span>
          <span>{articles.length} stories</span>
        </div>
      </header>

      {/* Sections */}
      <nav aria-label="Journal sections" className="sticky top-16 z-20 bg-paper/95 px-[var(--gutter)] py-3">
        <LayoutGroup>
          <ul className="no-scrollbar flex gap-2 overflow-x-auto">
            {(["All", ...categories] as const).map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className="t-label relative whitespace-nowrap rounded-full border border-ink/20 px-4 py-2"
                >
                  {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                  <span className={cn("relative transition-colors", cat === c && "text-paper")}>{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </LayoutGroup>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main key={cat} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: EASE }}>
          {cover && (
            <TransitionLink href={`/journal/${cover.slug}`} data-cursor="Read" className="group grid gap-8 px-[var(--gutter)] py-12 md:grid-cols-12">
              <div className="relative aspect-[4/5] overflow-hidden md:col-span-7 md:aspect-[5/4]">
                <div className="absolute inset-0 transition-transform duration-[1600ms] ease-[var(--ease-expo)] group-hover:scale-[1.04]">
                  <Plate {...cover.cover} grain />
                </div>
                <span className="t-label absolute left-4 top-4 bg-paper px-2 py-1">Cover story</span>
              </div>
              <div className="flex flex-col justify-between gap-8 md:col-span-5">
                <div>
                  <p className="t-label opacity-60">
                    {cover.category} — {cover.read}
                  </p>
                  <h2 className="t-serif mt-4 text-[clamp(2.6rem,5.6vw,6rem)] italic leading-[0.95]">{cover.title}</h2>
                  <p className="t-body mt-6 max-w-[40ch] opacity-75">{cover.dek}</p>
                </div>
                <p className="t-label flex justify-between border-t border-ink/20 pt-3">
                  <span>By {cover.author}</span>
                  <span>{cover.date}</span>
                </p>
              </div>
            </TransitionLink>
          )}

          <Marquee className="border-y border-ink py-3" speed={50}>
            {categories.map((c) => (
              <span key={c} className="t-display px-6 text-3xl">
                {c} <span className="opacity-30">✦</span>
              </span>
            ))}
          </Marquee>

          {/* Contents — each entry set differently */}
          <ol className="px-[var(--gutter)] py-12">
            {rest.map((a, k) => {
              const style = k % 3;
              return (
                <li key={a.slug} className="border-b border-ink/15">
                  <TransitionLink
                    href={`/journal/${a.slug}`}
                    data-cursor="Read"
                    onMouseEnter={() => style !== 1 && setPreview(a)}
                    onMouseLeave={() => setPreview(null)}
                    className={cn("group grid items-baseline gap-4 py-8 md:grid-cols-12", style === 1 && "items-center")}
                  >
                    <span className="t-label opacity-50 md:col-span-1">{String(k + 2).padStart(2, "0")}</span>
                    {style === 0 && (
                      <>
                        <span className="t-display text-[clamp(2rem,4.6vw,4.6rem)] leading-[0.95] transition-transform duration-700 group-hover:translate-x-3 md:col-span-7">{a.title}</span>
                        <span className="t-label opacity-60 md:col-span-2">{a.category}</span>
                        <span className="t-label opacity-60 md:col-span-2 md:text-right">{a.read}</span>
                      </>
                    )}
                    {style === 1 && (
                      <>
                        <span className="relative block aspect-[3/2] overflow-hidden md:col-span-4">
                          <span className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-105">
                            <Plate {...a.cover} />
                          </span>
                        </span>
                        <span className="md:col-span-6 md:col-start-6">
                          <span className="t-label block opacity-60">{a.category}</span>
                          <span className="t-serif mt-2 block text-[clamp(1.8rem,3.4vw,3.4rem)] italic leading-none">{a.title}</span>
                          <span className="t-body mt-3 block max-w-[46ch] opacity-70">{a.dek}</span>
                        </span>
                      </>
                    )}
                    {style === 2 && (
                      <>
                        <span className="t-condensed text-[clamp(2.4rem,6vw,6.4rem)] uppercase leading-[0.85] md:col-span-8">{a.title}</span>
                        <span className="t-body opacity-70 md:col-span-3">
                          {a.dek}
                          <span className="t-label mt-2 block opacity-70">
                            {a.category} · {a.author}
                          </span>
                        </span>
                      </>
                    )}
                  </TransitionLink>
                </li>
              );
            })}
          </ol>
        </motion.main>
      </AnimatePresence>

      {!touch && (
        <div ref={floater} className="pointer-events-none fixed left-0 top-0 z-30 h-[34vh] w-[26vh]" aria-hidden>
          <AnimatePresence>
            {preview && (
              <motion.div
                key={preview.slug}
                className="absolute inset-0 overflow-hidden"
                initial={{ clipPath: "inset(50% 50% 50% 50%)", rotate: -4 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", rotate: 0 }}
                exit={{ clipPath: "inset(50% 50% 50% 50%)", opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Plate {...preview.cover} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
