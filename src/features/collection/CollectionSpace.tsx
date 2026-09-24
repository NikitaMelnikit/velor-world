"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useCollector, useCollectorHydrated, useUI, type CollectKind, type SavedItem } from "@/lib/store";
import { cn, pad } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { useIsTouch } from "@/hooks";
import { getProduct, products } from "@/content/products";
import { getMaterial, materials } from "@/content/materials";
import { getArticle, articles } from "@/content/journal";
import { unbuilt, years } from "@/content/archive";
import { concepts } from "@/content/world";
import { journey, rooms } from "@/content/rooms";
import { Plate } from "@/components/media/Plate";
import { MaterialTexture } from "@/components/media/MaterialTexture";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SplitReveal } from "@/components/type";
import { collectObject } from "@/features/objects/ProductWorld";
import { collectMaterial } from "@/features/materials/MaterialLab";
import { collectArticle } from "@/features/journal/JournalIndex";
import { ArchiveVisual } from "@/features/archive/ArchiveExperience";

const KINDS: { id: CollectKind; label: string }[] = [
  { id: "object", label: "Objects" },
  { id: "material", label: "Materials" },
  { id: "article", label: "Stories" },
  { id: "project", label: "Projects" },
  { id: "idea", label: "Ideas" },
  { id: "concept", label: "Concepts" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Every kept thing gets a visual drawn from the world it came from. */
function ItemVisual({ item }: { item: SavedItem }) {
  switch (item.kind) {
    case "object": {
      const p = getProduct(item.ref ?? "");
      if (!p) break;
      return (
        <div className="absolute inset-0" style={{ background: p.env.bg, color: p.env.fg }}>
          <div className="absolute inset-[14%]">
            <ElevationDrawing product={p} mode="solid" />
          </div>
        </div>
      );
    }
    case "material": {
      const m = getMaterial(item.ref ?? "");
      if (!m) break;
      return <MaterialTexture kind={m.texture} />;
    }
    case "article": {
      const a = getArticle(item.ref ?? "");
      if (!a) break;
      return (
        <div className="absolute inset-0">
          <Plate {...a.cover} />
          <p className="t-serif absolute inset-x-3 bottom-3 text-xl italic leading-tight text-bone mix-blend-difference">{a.title}</p>
        </div>
      );
    }
    case "project": {
      for (const y of years) {
        const it = y.items.find((x) => x.id === item.ref);
        if (it) return <ArchiveVisual item={it} filter={y.era.filter} />;
      }
      break;
    }
    case "idea": {
      const u = unbuilt.find((x) => x.id === item.ref);
      if (!u) break;
      return (
        <div className="absolute inset-0" style={{ filter: "sepia(0.8)" }}>
          <Plate {...u.plate} />
          <span className="absolute inset-x-0 top-1/2 h-[3px] -rotate-12 bg-rust" />
        </div>
      );
    }
    case "concept": {
      const c = concepts.find((x) => x.slug === item.ref);
      return (
        <div className="absolute inset-0 grid place-items-center bg-[#0a0a09] text-bone">
          <svg viewBox="0 0 100 100" className="size-2/3 opacity-70" aria-hidden>
            <path d="M20 70 L50 30 L80 70 Z M20 70 L50 85 L80 70 M50 30 L50 85" fill="none" stroke="currentColor" strokeDasharray="3 2" />
          </svg>
          <span className="t-label absolute left-3 top-3 text-[0.6rem]">{c?.code}</span>
        </div>
      );
    }
  }
  return <div className="absolute inset-0 bg-graphite" />;
}

/**
 * 11 — COLLECTOR. A private room inside the world: what you kept, laid out
 * on a table you can rearrange, annotated in your own words.
 */
export function CollectionSpace() {
  const hydrated = useCollectorHydrated();
  const { name, number, openedAt, items, create, reset } = useCollector();
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"table" | "index">("table");
  const [filter, setFilter] = useState<CollectKind | "all">("all");
  const touch = useIsTouch();

  if (!hydrated) return <div className="min-h-svh bg-paper" />;

  if (!name) {
    return (
      <section className="relative grid min-h-svh place-items-center overflow-hidden bg-paper px-[var(--gutter)] py-28 text-ink" data-tone="light">
        <div className="absolute inset-0 opacity-30">
          <Plate kind="columns" tone="bone" seed={12} />
        </div>
        <div className="relative w-full max-w-4xl text-center">
          <p className="t-label opacity-60">∞ — Collector</p>
          <SplitReveal as="h1" text="CREATE YOUR COLLECTION" immediate delay={0.2} className="t-display mt-6 text-[clamp(2.8rem,8vw,8rem)] leading-[0.85]" />
          <p className="t-body mx-auto mt-8 max-w-[44ch] opacity-75">
            A private archive inside the world. Keep objects, materials, stories, projects and ideas as you wander — they&apos;ll wait for you here.
          </p>
          <form
            className="mx-auto mt-12 flex max-w-xl flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              create(draft);
              pulse.emit({ strength: 1, kind: "collect" });
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Name your collection</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Name it — e.g. Things with weight"
                maxLength={48}
                className="t-display w-full border-b border-ink/40 bg-transparent py-3 text-2xl outline-none placeholder:text-ink/30 focus:border-ink"
              />
            </label>
            <button type="submit" className="t-label bg-ink px-8 py-4 text-paper" data-cursor="Begin">
              Begin →
            </button>
          </form>
        </div>
      </section>
    );
  }

  const shown = filter === "all" ? items : items.filter((i) => i.kind === filter);
  const opened = openedAt ? new Date(openedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

  return (
    <div className="min-h-svh bg-[#ebe6dc] text-ink" data-tone="light">
      <header className="px-[var(--gutter)] pb-10 pt-28">
        <p className="t-label opacity-60">∞ — Your archive</p>
        <h1 className="t-display mt-3 text-[clamp(3rem,10vw,11rem)] leading-[0.85]">{name}</h1>
        <div className="t-label mt-6 flex flex-wrap gap-x-8 gap-y-2 opacity-70">
          <span>Collection no. {number}</span>
          <span>Opened {opened}</span>
          <span>{pad(items.length)} pieces</span>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-ink/15 py-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {([{ id: "all", label: "All" }, ...KINDS] as const).map((k) => {
              const count = k.id === "all" ? items.length : items.filter((i) => i.kind === k.id).length;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setFilter(k.id)}
                  aria-pressed={filter === k.id}
                  className={cn("t-label whitespace-nowrap rounded-full border px-3 py-1.5 transition-colors", filter === k.id ? "border-ink bg-ink text-paper" : "border-ink/20")}
                >
                  {k.label} {pad(count)}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="View">
            {(["table", "index"] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("t-label px-3 py-1.5", view === v ? "underline underline-offset-4" : "opacity-50")}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : view === "table" && !touch ? (
        <Table items={shown} />
      ) : (
        <Index items={shown} />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-4 px-[var(--gutter)] py-16">
        <TransitionLink href="/world" className="t-label border-b border-ink/40 pb-0.5" data-cursor="Map">
          Keep exploring the world →
        </TransitionLink>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear this collection? This only affects this browser.")) reset();
          }}
          className="t-label opacity-50 hover:opacity-100"
        >
          Clear collection
        </button>
      </footer>
    </div>
  );
}

function Card({ item, className }: { item: SavedItem; className?: string }) {
  const remove = useCollector((s) => s.remove);
  const setNote = useCollector((s) => s.setNote);
  const [editing, setEditing] = useState(false);
  return (
    <div className={cn("group bg-paper p-2.5 pb-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)]", className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <ItemVisual item={item} />
        <span className="t-label absolute left-2 top-2 bg-paper/90 px-1.5 py-0.5 text-[0.58rem]">{item.kind}</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <TransitionLink href={item.href} className="t-display block truncate text-lg" data-cursor="Visit">
            {item.title}
          </TransitionLink>
          {item.meta && <p className="t-label truncate text-[0.6rem] opacity-55">{item.meta}</p>}
        </div>
        <button type="button" onClick={() => remove(item.id)} className="t-label text-[0.6rem] opacity-40 hover:opacity-100" aria-label={`Remove ${item.title}`} data-cursor="Release">
          ✕
        </button>
      </div>
      {editing ? (
        <textarea
          autoFocus
          defaultValue={item.note}
          onBlur={(e) => {
            setNote(item.id, e.target.value);
            setEditing(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Why did you keep this?"
          rows={2}
          className="t-serif mt-2 w-full resize-none bg-transparent text-base italic outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} onPointerDown={(e) => e.stopPropagation()} className="t-serif mt-2 block text-left text-base italic opacity-70 hover:opacity-100">
          {item.note || "+ Add a note"}
        </button>
      )}
    </div>
  );
}

/** A table you can rearrange. Positions persist in the browser. */
function Table({ items }: { items: SavedItem[] }) {
  const area = useRef<HTMLDivElement>(null);
  const rows = Math.max(1, Math.ceil(items.length / 4));
  return (
    <div ref={area} className="relative mx-[var(--gutter)] mb-10 overflow-hidden border border-ink/10" style={{ height: `${Math.max(80, rows * 44 + 20)}vh` }}>
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <AnimatePresence>
        {items.map((item, i) => (
          <TableItem key={item.id} item={item} i={i} rows={rows} area={area} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function TableItem({ item, i, rows, area }: { item: SavedItem; i: number; rows: number; area: React.RefObject<HTMLDivElement | null> }) {
  const setPos = useCollector((s) => s.setPos);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const left = item.pos?.x ?? 3 + (i % 4) * 24.5;
  const top = item.pos?.y ?? 4 + Math.floor(i / 4) * (100 / rows) * 0.92;
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={area}
      dragElastic={0.05}
      whileDrag={{ scale: 1.05, zIndex: 30, rotate: 0 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, rotate: ((i * 37) % 7) - 3 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: EASE }}
      onDragEnd={() => {
        const box = area.current?.getBoundingClientRect();
        if (!box) return;
        setPos(item.id, {
          x: Math.min(80, Math.max(0, left + (x.get() / box.width) * 100)),
          y: Math.min(90, Math.max(0, top + (y.get() / box.height) * 100)),
        });
        x.set(0);
        y.set(0);
        pulse.emit({ strength: 0.2, kind: "tap" });
      }}
      className="absolute w-[22%] cursor-grab active:cursor-grabbing"
      style={{ left: `${left}%`, top: `${top}%`, x, y }}
      data-cursor="Move"
    >
      <Card item={item} />
    </motion.div>
  );
}

function Index({ items }: { items: SavedItem[] }) {
  return (
    <div className="px-[var(--gutter)]">
      {KINDS.map((k) => {
        const group = items.filter((i) => i.kind === k.id);
        if (!group.length) return null;
        return (
          <section key={k.id} className="mb-14">
            <h2 className="t-label mb-4 flex justify-between border-b border-ink/20 pb-2">
              <span>{k.label}</span>
              <span>{pad(group.length)}</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {group.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EmptyState() {
  const toggle = useCollector((s) => s.toggle);
  const suggestions = [collectObject(products[0]), collectMaterial(materials[0]), collectArticle(articles[0])];
  const notify = useUI((s) => s.notify);
  return (
    <div className="px-[var(--gutter)] pb-10">
      <p className="t-serif max-w-[24ch] text-[clamp(2rem,4vw,4rem)] italic leading-tight">The table is empty. Most collections begin with one object.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              toggle(s);
              notify({ title: s.title, meta: "Your first piece" });
            }}
            className="t-label border border-ink/30 px-4 py-3 hover:bg-ink hover:text-paper"
          >
            + Keep {s.title}
          </button>
        ))}
      </div>
      <p className="t-label mt-12 opacity-60">Or wander and collect as you go:</p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {journey.map((id) => (
          <li key={id}>
            <TransitionLink href={rooms[id].href} className="t-display text-2xl hover:underline">
              {rooms[id].name}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
