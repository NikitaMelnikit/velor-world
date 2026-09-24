"use client";

import { useEffect, useRef, useState } from "react";
import type { AnatomyArticle } from "@/content/journal";
import { getProduct } from "@/content/products";
import { cn } from "@/lib/utils";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SplitReveal } from "@/components/type";

/** DESIGN — a close reading: the drawing stays, the notes scroll past, parts light up. */
export function AnatomyLayout({ a }: { a: AnatomyArticle }) {
  const product = getProduct(a.product)!;
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const note = a.notes[active];

  return (
    <div className="bg-[#101418] text-[#dfe6ea]" data-tone="dark">
      <header className="grid min-h-[80svh] content-end gap-8 px-[var(--gutter)] pb-14 pt-32 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="t-label opacity-60">
            {a.category} — {a.author}
          </p>
          <SplitReveal as="h1" text={a.title} immediate delay={0.2} className="t-display mt-4 text-[clamp(3rem,8vw,9rem)]" />
        </div>
        <p className="t-body self-end opacity-75 md:col-span-4">{a.intro}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="sticky top-0 z-10 h-[46svh] bg-[#101418] md:h-svh">
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "linear-gradient(rgba(223,230,234,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(223,230,234,0.07) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="absolute inset-[10%]">
            <ElevationDrawing product={product} mode="line" highlight={note.part} xray />
          </div>
          <p className="t-label absolute left-[var(--gutter)] top-20 opacity-60 md:top-24">
            {product.name} · part {String(active + 1).padStart(2, "0")} — {note.title}
          </p>
        </div>
        <ol className="px-[var(--gutter)] md:px-[4vw]">
          {a.notes.map((n, k) => (
            <li
              key={n.part}
              data-i={k}
              ref={(el) => {
                refs.current[k] = el;
              }}
              className={cn("flex min-h-[70svh] flex-col justify-center border-t border-current/10 py-12 transition-opacity duration-700", k === active ? "opacity-100" : "opacity-30")}
            >
              <span className="t-display text-[clamp(4rem,8vw,8rem)] leading-none text-[#8fb3c7]">{String(k + 1).padStart(2, "0")}</span>
              <h2 className="t-display mt-4 text-3xl">{n.title}</h2>
              <p className="t-body mt-4 max-w-[36ch] text-[1.15rem] opacity-80">{n.text}</p>
            </li>
          ))}
          <li className="py-[12vh]">
            <TransitionLink href={`/objects/${product.slug}`} className="t-label inline-block border border-current/30 px-5 py-3" data-cursor="Object">
              Enter {product.name} →
            </TransitionLink>
          </li>
        </ol>
      </div>
    </div>
  );
}
