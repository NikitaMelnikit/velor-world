"use client";

import type { InterviewArticle } from "@/content/journal";
import { Plate } from "@/components/media/Plate";
import { Rise, SplitReveal } from "@/components/type";

/** INTERVIEW — a voice, not a page: giant initials, Q in type, A in speech. */
export function InterviewLayout({ a }: { a: InterviewArticle }) {
  return (
    <div className="bg-graphite text-bone" data-tone="dark">
      <header className="grid min-h-svh grid-cols-1 gap-8 px-[var(--gutter)] pb-16 pt-28 md:grid-cols-12">
        <div className="relative flex flex-col justify-between md:col-span-7">
          <p className="t-label opacity-60">
            {a.category} — {a.date}
          </p>
          <p className="t-display t-outline select-none text-[clamp(10rem,34vw,34rem)] leading-[0.78] opacity-70" aria-hidden>
            {a.subject.initials}
          </p>
          <div>
            <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-display text-[clamp(2.6rem,6vw,6.4rem)]" />
            <p className="t-body mt-5 max-w-[46ch] opacity-70">{a.dek}</p>
          </div>
        </div>
        <figure className="relative min-h-[50svh] overflow-hidden md:col-span-5">
          <Plate {...a.cover} grain />
          <figcaption className="t-label absolute bottom-4 left-4 right-4 flex justify-between">
            <span>{a.subject.name}</span>
            <span>{a.subject.role}</span>
          </figcaption>
        </figure>
      </header>

      <div className="px-[var(--gutter)] py-[12vh]">
        <Rise>
          <p className="t-serif max-w-[34ch] text-[clamp(1.6rem,2.8vw,2.8rem)] italic leading-[1.2] opacity-90">{a.intro}</p>
        </Rise>
      </div>

      <div className="flex flex-col gap-[10vh] px-[var(--gutter)] pb-[14vh]">
        {a.qa.map((x, k) => (
          <div key={k} className="grid gap-6 md:grid-cols-12">
            <Rise className="md:col-span-4">
              <p className="t-label flex gap-3 leading-relaxed">
                <span className="text-brass">VELOR</span>
                <span className="normal-case tracking-normal opacity-80">{x.q}</span>
              </p>
            </Rise>
            <Rise className="relative md:col-span-7 md:col-start-6" delay={0.1}>
              <span className="t-display absolute -left-14 top-1 hidden text-sm opacity-50 md:block">{a.subject.initials}</span>
              <p className="t-body text-[1.25rem] leading-[1.65] opacity-90">{x.a}</p>
            </Rise>
            {k === 1 && (
              <div className="-mx-[var(--gutter)] my-[6vh] bg-bone px-[var(--gutter)] py-[10vh] text-ink md:col-span-12">
                <SplitReveal text={`“${a.pull}”`} className="t-serif max-w-[22ch] text-[clamp(2.2rem,5vw,5.2rem)] italic leading-[1]" />
                <p className="t-label mt-6 opacity-60">— {a.subject.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
