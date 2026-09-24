"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { journey, nextInJourney, rooms, type Room, type RoomId } from "@/content/rooms";
import { useCollector } from "@/lib/store";
import { cn, pad, rng } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { useIsTouch } from "@/hooks";
import { useTransition } from "@/components/transition/TransitionProvider";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Plate } from "@/components/media/Plate";
import { SplitReveal } from "@/components/type";

const W = 1600;
const H = 1000;
const CORE = { x: 800, y: 540 };

type Node = Room & { map: { x: number; y: number } };
const nodes = journey.map((id) => rooms[id] as Node);

/** Curved connection between two rooms, bowed away from the core. */
function curve(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.22) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
}

const fragments = (() => {
  const r = rng(77);
  return Array.from({ length: 22 }, (_, i) => ({
    x: 80 + r() * (W - 160),
    y: 80 + r() * (H - 160),
    code: `${["F", "M", "A", "X"][i % 4]}-${String(Math.floor(100 + r() * 800))}`,
    delay: r() * 14,
    dur: 8 + r() * 8,
    kind: i % 3,
  }));
})();

/**
 * 01 — WORLD. Not a geographic map: a plan of the brand itself. Rooms are
 * nodes, the journey is a line of light, and the territory is always
 * slightly alive — pulses travel, fragments surface, a scan line sweeps.
 */
export function WorldMap() {
  const { navigate } = useTransition();
  const touch = useIsTouch();
  const visited = useCollector((s) => s.visited);
  const [hover, setHover] = useState<RoomId | null>(null);
  const [selected, setSelected] = useState<RoomId | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [size, setSize] = useState({ w: 1600, h: 1000 });

  // The map plane is always a little larger than the viewport, so there's somewhere to go.
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.max(vw * 1.04, vh * 1.12 * (W / H));
      setSize({ w, h: w * (H / W) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Pointer parallax through CSS variables — no re-renders.
  useEffect(() => {
    const el = container.current;
    if (!el || touch) return;
    const on = (e: PointerEvent) => {
      el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [touch]);

  const explored = journey.filter((id) => visited.includes(id)).length;
  const next = nextInJourney("world" as RoomId, visited);
  const focus = (selected ?? hover) ? rooms[(selected ?? hover)!] : null;

  const paths = useMemo(() => nodes.slice(0, -1).map((n, i) => curve(n.map, nodes[i + 1].map, i % 2 ? 0.18 : -0.18)), []);

  const enter = (id: RoomId, e?: { clientX: number; clientY: number }) => {
    if (dragging.current) return;
    if (touch && selected !== id) {
      setSelected(id);
      pulse.emit({ strength: 0.4, kind: "tap" });
      return;
    }
    navigate(rooms[id].href, { origin: e ? { x: e.clientX, y: e.clientY } : undefined, variant: "iris" });
  };

  const layer = (depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth}px), 0)`,
  });

  return (
    <section ref={container} className="relative h-svh overflow-hidden bg-ink text-bone" aria-label="Map of the VELOR world" data-tone="dark">
      {/* Title block */}
      <div className="pointer-events-none absolute left-[var(--gutter)] top-[5.5rem] z-20 max-w-[34rem]">
        <p className="t-label mb-3 opacity-60">01 — Explore</p>
        <SplitReveal as="h1" text="The World" className="t-display size-huge" immediate delay={0.2} />
        <p className="t-body mt-4 max-w-[26rem] text-bone/65">
          A plan of the brand, not a place. Drag to wander, choose a room to enter. The map remembers where you&apos;ve been.
        </p>
      </div>

      <div className="pointer-events-none absolute right-[var(--gutter)] top-[5.5rem] z-20 hidden text-right md:block">
        <p className="t-label opacity-60">Journey</p>
        <p className="t-display text-5xl tabular-nums">
          {pad(explored)}
          <span className="opacity-30">/{pad(journey.length)}</span>
        </p>
        <p className="t-label mt-2 opacity-60">Rooms explored</p>
        <TransitionLink href={next.href} className="t-label pointer-events-auto mt-6 inline-flex items-center gap-2 border-b border-bone/40 pb-1" data-cursor="Go">
          Suggested next: {next.name} →
        </TransitionLink>
      </div>

      {/* The plane */}
      <motion.div
        ref={plane}
        drag
        dragConstraints={container}
        dragElastic={0.08}
        dragTransition={{ power: 0.25, timeConstant: 320 }}
        onDragStart={() => (dragging.current = true)}
        onDragEnd={() => setTimeout(() => (dragging.current = false), 60)}
        className="absolute left-1/2 top-1/2 cursor-grab touch-none active:cursor-grabbing"
        style={{ width: size.w, height: size.h, marginLeft: -size.w / 2, marginTop: -size.h / 2 }}
        data-cursor="Drag"
      >
        {/* Layer 1 — ground: grid, rings, axes */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" style={layer(10)} aria-hidden>
          <defs>
            <pattern id="map-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.18" />
            </pattern>
            <radialGradient id="map-fade" cx="0.5" cy="0.54" r="0.62">
              <stop offset="0.5" stopColor="#0b0b0a" stopOpacity="0" />
              <stop offset="1" stopColor="#0b0b0a" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#map-dots)" />
          {[120, 260, 420, 610].map((r, i) => (
            <circle key={r} cx={CORE.x} cy={CORE.y} r={r} fill="none" stroke="currentColor" strokeOpacity={0.14 - i * 0.02} strokeDasharray={i % 2 ? "2 8" : undefined} />
          ))}
          <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: "spin 90s linear infinite" }}>
            <circle cx={CORE.x} cy={CORE.y} r={340} fill="none" stroke="var(--color-brass)" strokeOpacity="0.35" strokeDasharray="1 14" strokeWidth="2" />
          </g>
          <line x1="0" x2={W} y1={CORE.y} y2={CORE.y} stroke="currentColor" strokeOpacity="0.1" />
          <line y1="0" y2={H} x1={CORE.x} x2={CORE.x} stroke="currentColor" strokeOpacity="0.1" />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={i * 40} x2={i * 40} y1={CORE.y - (i % 5 ? 4 : 10)} y2={CORE.y + (i % 5 ? 4 : 10)} stroke="currentColor" strokeOpacity="0.3" />
          ))}
          {[0, 400, 1200, 1600].map((x) => (
            <text key={x} x={x + 6} y={CORE.y - 14} fontSize="11" fill="currentColor" opacity="0.35" fontFamily="var(--font-mono)">
              {String(x - 800).padStart(4, "0")}
            </text>
          ))}
          {/* scan line */}
          <rect y="0" width="1" height={H} fill="var(--color-brass)" opacity="0.35">
            <animate attributeName="x" values={`0;${W}`} dur="14s" repeatCount="indefinite" />
          </rect>
          <rect width={W} height={H} fill="url(#map-fade)" />
        </svg>

        {/* Layer 2 — fragments surfacing */}
        <div className="pointer-events-none absolute inset-0" style={layer(18)} aria-hidden>
          {fragments.map((f, i) => (
            <span
              key={i}
              className="t-label absolute flex items-center gap-1.5 text-[0.58rem] text-bone/55 opacity-0"
              style={{
                left: `${(f.x / W) * 100}%`,
                top: `${(f.y / H) * 100}%`,
                animation: `fragment ${f.dur}s ease-in-out ${f.delay}s infinite`,
              }}
            >
              {f.kind === 0 && <span className="block size-1.5 border border-current" />}
              {f.kind === 1 && <span className="block size-1.5 rounded-full bg-current" />}
              {f.kind === 2 && <span className="block">+</span>}
              {f.code}
            </span>
          ))}
        </div>

        {/* Layer 3 — journey paths and light pulses */}
        <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" style={layer(24)} aria-hidden>
          {nodes.map((n) => (
            <line
              key={`s-${n.id}`}
              x1={CORE.x}
              y1={CORE.y}
              x2={n.map.x}
              y2={n.map.y}
              stroke="currentColor"
              strokeOpacity={focus?.id === n.id ? 0.55 : 0.1}
              strokeDasharray="3 7"
              className="transition-[stroke-opacity] duration-500"
            />
          ))}
          {paths.map((d, i) => {
            const lit = focus && (nodes[i].id === focus.id || nodes[i + 1].id === focus.id);
            return (
              <g key={i}>
                <path id={`journey-${i}`} d={d} fill="none" stroke="currentColor" strokeOpacity={lit ? 0.8 : 0.28} strokeWidth={lit ? 1.6 : 1} className="transition-all duration-500" />
                <circle r="3.2" fill="var(--color-brass)">
                  <animateMotion dur={`${5 + (i % 3)}s`} begin={`${i * 0.7}s`} repeatCount="indefinite">
                    <mpath href={`#journey-${i}`} />
                  </animateMotion>
                </circle>
                <circle r="1.8" fill="#e7e2d7" opacity="0.7">
                  <animateMotion dur={`${7 + (i % 2)}s`} begin={`${i * 1.3 + 2}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                    <mpath href={`#journey-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Layer 4 — rooms */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" style={layer(34)}>
          {/* the core: where the corridor ended */}
          <g transform={`translate(${CORE.x} ${CORE.y})`} aria-hidden>
            <rect x="-9" y="-9" width="18" height="18" fill="none" stroke="currentColor" strokeOpacity="0.6" transform="rotate(45)" />
            <circle r="3" fill="currentColor" />
            <text y="36" textAnchor="middle" fontSize="11" letterSpacing="2" fill="currentColor" opacity="0.5" fontFamily="var(--font-mono)">
              00 — THRESHOLD
            </text>
          </g>

          {nodes.map((n) => {
            const active = focus?.id === n.id;
            const seen = visited.includes(n.id);
            const right = n.map.x > 1300;
            return (
              <g
                key={n.id}
                transform={`translate(${n.map.x} ${n.map.y})`}
                role="link"
                tabIndex={0}
                aria-label={`Room ${n.index}: ${n.name} — ${n.line}${seen ? " (visited)" : ""}`}
                data-cursor={touch ? undefined : "Enter"}
                className="cursor-pointer outline-none"
                onMouseEnter={() => {
                  setHover(n.id);
                  pulse.emit({ strength: 0.12, kind: "hover" });
                }}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.id)}
                onBlur={() => setHover(null)}
                onClick={(e) => enter(n.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const r = (e.currentTarget as SVGGElement).getBoundingClientRect();
                    navigate(n.href, { origin: { x: r.x + r.width / 2, y: r.y + r.height / 2 }, variant: "iris" });
                  }
                }}
              >
                <circle r="70" fill="transparent" />
                <circle r="30" fill="none" stroke="currentColor" strokeOpacity="0.35" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "breathe 3.6s ease-in-out infinite" }} />
                <circle
                  r={active ? 44 : 22}
                  fill={active ? "rgba(199,170,116,0.08)" : "none"}
                  stroke={seen ? "var(--color-brass)" : "currentColor"}
                  strokeWidth="1.2"
                  className="transition-all duration-700 ease-[var(--ease-expo)]"
                />
                <circle r={active ? 7 : 5} fill={seen ? "var(--color-brass)" : "currentColor"} className="transition-all duration-500" />
                <g transform={`translate(${right ? -56 : 56} -6)`} textAnchor={right ? "end" : "start"}>
                  <text fontSize="12" letterSpacing="2.4" fill="currentColor" opacity="0.5" fontFamily="var(--font-mono)" y="-26">
                    {n.index}
                    {seen ? " — VISITED" : ""}
                  </text>
                  <text fontSize="40" fill="currentColor" fontFamily="var(--font-archivo)" style={{ fontVariationSettings: '"wdth" 125', letterSpacing: "-0.03em" }} y="12" fontWeight={500}>
                    {n.name}
                  </text>
                  <text fontSize="12" letterSpacing="2" fill="currentColor" opacity="0.55" fontFamily="var(--font-mono)" y="36">
                    {n.line.toUpperCase()}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Focus card */}
      <AnimatePresence>
        {focus && (
          <motion.aside
            key={focus.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-30 flex gap-4 bg-bone text-ink",
              touch ? "inset-x-3 bottom-16 p-3" : "pointer-events-none bottom-20 right-[var(--gutter)] w-[26rem] p-3",
            )}
          >
            <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden md:w-32">
              <Plate {...focus.plate} />
            </div>
            <div className="flex flex-col justify-between py-1 pr-1">
              <div>
                <p className="t-label opacity-60">
                  Room {focus.index} — {focus.line}
                </p>
                <p className="t-display mt-1 text-2xl">{focus.name}</p>
                <p className="mt-2 text-sm leading-snug opacity-75">{focus.description}</p>
              </div>
              {touch ? (
                <div className="mt-3 flex gap-3">
                  <TransitionLink href={focus.href} variant="iris" className="t-label bg-ink px-4 py-2 text-bone">
                    Enter →
                  </TransitionLink>
                  <button type="button" className="t-label px-2" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              ) : (
                <p className="t-label mt-3">Click to enter →</p>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Accessible legend */}
      <nav aria-label="Rooms" className="absolute bottom-16 left-[var(--gutter)] z-20 hidden md:block">
        <ol className="flex flex-col gap-1">
          {nodes.map((n) => (
            <li key={n.id}>
              <TransitionLink
                href={n.href}
                className={cn("t-label flex items-center gap-3 transition-opacity", focus && focus.id !== n.id ? "opacity-35" : "opacity-75 hover:opacity-100")}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                <span className={cn("block size-1.5 rounded-full", visited.includes(n.id) ? "bg-brass" : "border border-current")} />
                {n.index} {n.name}
              </TransitionLink>
            </li>
          ))}
        </ol>
      </nav>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  );
}
