"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { roomFromPath } from "@/content/rooms";
import { useCollector, useUI } from "@/lib/store";
import { pad, cn } from "@/lib/utils";
import { pulse } from "@/lib/pulse";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SoundToggle } from "@/components/sound/SoundLayer";

function MenuButton() {
  const open = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  return (
    <button
      type="button"
      id="menu-button"
      onClick={() => {
        setMenu(!open);
        pulse.emit({ strength: 0.5, kind: "tap" });
      }}
      aria-expanded={open}
      aria-controls="world-menu"
      data-cursor={open ? "Close" : "Rooms"}
      className="group flex items-center gap-3"
    >
      <span className="t-label hidden sm:inline">{open ? "Close" : "Rooms"}</span>
      <span className="relative block h-3 w-7">
        <span className={cn("absolute left-0 top-0 h-px w-full bg-current transition-transform duration-700 ease-[var(--ease-velor)]", open && "translate-y-[5.5px] rotate-[20deg]")} />
        <span
          className={cn(
            "absolute bottom-0 right-0 h-px w-2/3 bg-current transition-all duration-700 ease-[var(--ease-velor)] group-hover:w-full",
            open && "w-full -translate-y-[5.5px] -rotate-[20deg]",
          )}
        />
      </span>
    </button>
  );
}

/**
 * The HUD is the world's instrument panel: where you are, how deep you've
 * gone, what you're carrying, and the sound of the place.
 */
export function Hud() {
  const pathname = usePathname();
  const room = roomFromPath(pathname);
  const count = useCollector((s) => s.items.length);
  const visit = useCollector((s) => s.visit);
  const sub = useUI((s) => s.sub);
  const depth = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const top = useRef<HTMLElement>(null);
  const bottom = useRef<HTMLElement>(null);

  useEffect(() => {
    if (room.id !== "home" && room.id !== "collection") visit(room.id);
  }, [room.id, visit]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (depth.current) depth.current.textContent = `${(window.scrollY / 40).toFixed(1).padStart(6, "0")} M`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      // Which section sits under the instruments?
      const sample = (y: number) => {
        const el = document.elementsFromPoint(window.innerWidth / 2, y).find((e) => !e.closest(".hud"));
        return el?.closest<HTMLElement>("[data-tone]")?.dataset.tone ?? "";
      };
      if (top.current) top.current.dataset.tone = sample(28);
      if (bottom.current) bottom.current.dataset.tone = sample(window.innerHeight - 24);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const t = setTimeout(update, 900);
    const i = setInterval(update, 1200);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
      clearTimeout(t);
      clearInterval(i);
    };
  }, [pathname]);

  return (
    <>
      <header ref={top} className="hud pointer-events-none fixed inset-x-0 top-0 z-[70] grid grid-cols-[1fr_auto] items-start gap-6 px-[var(--gutter)] pt-5 md:grid-cols-[1fr_auto_1fr]">
        <TransitionLink href="/" data-cursor="Entry" className="pointer-events-auto justify-self-start" aria-label="VELOR — back to the entry">
          <span className="t-display block text-[1.35rem] leading-none tracking-[-0.03em]">VELOR</span>
        </TransitionLink>

        <div className="t-label hidden items-center gap-3 md:flex" aria-live="polite">
          <span className="opacity-50">{room.index}</span>
          <span className="h-px w-6 bg-current opacity-40" />
          <span>{room.name}</span>
          {sub && (
            <>
              <span className="opacity-40">/</span>
              <span className="opacity-70">{sub}</span>
            </>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-6 justify-self-end">
          <TransitionLink href="/collection" data-cursor="Your archive" className="t-label group flex items-center gap-2">
            <span className="hidden sm:inline">Collection</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full border border-current px-1 tabular-nums">{pad(count)}</span>
          </TransitionLink>
          <MenuButton />
        </div>
      </header>

      <footer ref={bottom} className="hud pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex items-end justify-between gap-6 px-[var(--gutter)] pb-4">
        <SoundToggle className="pointer-events-auto" />
        <span className="t-label hidden opacity-60 lg:block">Objects with a point of view.</span>
        <div className="flex flex-col items-end gap-1.5">
          <span ref={depth} className="t-label tabular-nums" aria-hidden>
            0000.0 M
          </span>
          <span className="block h-px w-24 bg-current/25">
            <span ref={bar} className="block h-full w-full origin-left bg-current" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      </footer>
    </>
  );
}
