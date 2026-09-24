"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { navOrder, roomFromPath, rooms, type RoomId } from "@/content/rooms";
import { useCollector, useUI } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Plate } from "@/components/media/Plate";
import { SoundToggle } from "@/components/sound/SoundLayer";

const EASE = [0.76, 0, 0.24, 1] as const;

/** Wraps the page: when the menu opens, the whole room recedes into depth. */
export function Stage({ children }: { children: ReactNode }) {
  const open = useUI((s) => s.menuOpen);
  const reduced = useReducedMotion();
  return (
    <motion.div
      id="stage"
      className="relative min-h-svh"
      initial={false}
      animate={
        open && !reduced
          ? { scale: 0.9, y: "4vh", borderRadius: 20, opacity: 0.55 }
          : { scale: 1, y: 0, borderRadius: 0, opacity: 1 }
      }
      transition={{ duration: 1, ease: EASE }}
      style={{ transformOrigin: "50% 50vh", overflow: open ? "clip" : "visible" }}
      aria-hidden={open || undefined}
      inert={open || undefined}
    >
      <div id="page">{children}</div>
    </motion.div>
  );
}

/** Navigation as its own immersive layer — eight rooms, one map. */
export function MenuOverlay() {
  const open = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const pathname = usePathname();
  const current = roomFromPath(pathname).id;
  const visited = useCollector((s) => s.visited);
  const [hover, setHover] = useState<RoomId>("world");
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => first.current?.focus({ preventScroll: true }), 400);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.getElementById("menu-button")?.focus({ preventScroll: true });
    };
  }, [open, setMenu]);

  const shown = rooms[hover];

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          id="world-menu"
          aria-label="Rooms of the VELOR world"
          className="fixed inset-0 z-[65] overflow-y-auto overscroll-contain text-bone"
          data-lenis-prevent
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
          transition={{ duration: 0.95, ease: EASE }}
          onAnimationStart={() => setHover(current === "home" || current === "collection" ? "world" : current)}
        >
          <div className="absolute inset-0 bg-ink/[0.86]" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
            <defs>
              <pattern id="menu-grid" width="96" height="96" patternUnits="userSpaceOnUse">
                <path d="M96 0 H0 V96" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#menu-grid)" />
          </svg>

          <div className="relative grid min-h-svh grid-cols-1 gap-10 px-[var(--gutter)] pb-28 pt-24 lg:grid-cols-[1.25fr_1fr]">
            <ol className="flex flex-col justify-center">
              {navOrder.map((id, i) => {
                const r = rooms[id];
                const here = current === id;
                const seen = visited.includes(id);
                return (
                  <motion.li
                    key={id}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}
                    className="border-b border-bone/10"
                  >
                    <TransitionLink
                      ref={i === 0 ? first : undefined}
                      href={r.href}
                      onMouseEnter={() => setHover(id)}
                      onFocus={() => setHover(id)}
                      data-cursor={here ? "Here" : "Enter"}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-2 outline-none md:grid-cols-[3.5rem_1fr_auto] md:py-1"
                    >
                      <span className="t-label opacity-50">{r.index}</span>
                      <span
                        className={cn(
                          "t-display text-[clamp(2.2rem,6.2vw,6.4rem)] transition-[transform,color,font-variation-settings] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3 group-focus-visible:translate-x-3",
                          hover !== id && "text-bone/45",
                        )}
                      >
                        {r.name}
                      </span>
                      <span className="t-label flex items-center gap-2 opacity-70">
                        {here ? (
                          <>
                            <span className="size-1.5 rounded-full bg-brass" />
                            <span className="hidden sm:inline">You are here</span>
                          </>
                        ) : seen ? (
                          <span className="hidden sm:inline">Visited</span>
                        ) : null}
                      </span>
                    </TransitionLink>
                  </motion.li>
                );
              })}
            </ol>

            <div className="relative hidden flex-col justify-center lg:flex">
              <div className="relative aspect-[4/5] w-full max-w-[34rem] self-end overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={hover}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0% 0% 100% 0%)", scale: 1.15 }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Plate {...shown.plate} />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <span className="t-label">
                    Room {shown.index} — {shown.line}
                  </span>
                </div>
              </div>
              <p className="t-body mt-6 max-w-[34rem] self-end text-bone/70">{shown.description}</p>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 px-[var(--gutter)] pb-5">
            <TransitionLink href="/collection" className="t-label border border-bone/30 px-4 py-2.5 transition-colors hover:bg-bone hover:text-ink" data-cursor="Begin">
              Create your collection
            </TransitionLink>
            <span className="t-label hidden opacity-50 md:block">Don&apos;t visit the brand. Enter it.</span>
            <SoundToggle />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
