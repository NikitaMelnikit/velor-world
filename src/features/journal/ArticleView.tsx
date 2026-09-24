"use client";

import { useEffect } from "react";
import { articles, type Article } from "@/content/journal";
import { useUI } from "@/lib/store";
import { Plate } from "@/components/media/Plate";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CollectButton } from "@/components/collect/CollectButton";
import { collectArticle } from "./JournalIndex";
import { EssayLayout } from "./layouts/Essay";
import { InterviewLayout } from "./layouts/Interview";
import { ContactLayout } from "./layouts/ContactSheet";
import { HorizontalLayout } from "./layouts/Horizontal";
import { ManifestoLayout } from "./layouts/Manifesto";
import { VisualLayout } from "./layouts/Visual";
import { AnatomyLayout } from "./layouts/Anatomy";

/** Every story chooses its own layout system — no shared template. */
export function ArticleView({ slug }: { slug: string }) {
  const a = articles.find((x) => x.slug === slug)!;
  const setSub = useUI((s) => s.setSub);
  useEffect(() => {
    setSub(a.category.toUpperCase());
    return () => setSub(null);
  }, [a, setSub]);

  return (
    <article aria-label={a.title}>
      {a.layout === "essay" && <EssayLayout a={a} />}
      {a.layout === "interview" && <InterviewLayout a={a} />}
      {a.layout === "contact" && <ContactLayout a={a} />}
      {a.layout === "horizontal" && <HorizontalLayout a={a} />}
      {a.layout === "manifesto" && <ManifestoLayout a={a} />}
      {a.layout === "visual" && <VisualLayout a={a} />}
      {a.layout === "anatomy" && <AnatomyLayout a={a} />}
      <ArticleEnd a={a} />
    </article>
  );
}

function ArticleEnd({ a }: { a: Article }) {
  const i = articles.indexOf(a);
  const next = articles[(i + 1) % articles.length];
  return (
    <footer className="bg-ink text-bone" data-tone="dark">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-bone/10 px-[var(--gutter)] py-10">
        <div className="flex items-center gap-4">
          <CollectButton item={collectArticle(a)} />
          <TransitionLink href="/journal" className="t-label border-b border-bone/40 pb-0.5" data-cursor="Journal">
            All stories
          </TransitionLink>
        </div>
        <p className="t-label opacity-50">
          {a.category} · {a.author} · {a.date}
        </p>
      </div>
      <TransitionLink href={`/journal/${next.slug}`} data-cursor="Read" className="group grid gap-8 px-[var(--gutter)] py-[12vh] md:grid-cols-[1fr_1.4fr]">
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-105">
            <Plate {...next.cover} />
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <p className="t-label opacity-60">Continue reading — {next.category}</p>
          <p className="t-serif mt-3 text-[clamp(2.4rem,6vw,6.6rem)] italic leading-[0.92]">{next.title}</p>
          <p className="t-body mt-4 max-w-[44ch] opacity-70">{next.dek}</p>
        </div>
      </TransitionLink>
    </footer>
  );
}
