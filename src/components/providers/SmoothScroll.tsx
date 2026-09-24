"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { useReducedMotion } from "@/hooks";
import { useUI } from "@/lib/store";

type ScrollApi = {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, opts?: { immediate?: boolean; offset?: number; duration?: number }) => void;
};

const ScrollContext = createContext<ScrollApi>({ lenis: null, scrollTo: () => {} });

export const useScroll = () => useContext(ScrollContext);

/**
 * Lenis drives the page, GSAP's ticker drives Lenis, ScrollTrigger listens —
 * one rAF loop for the whole world. Disabled entirely for reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const menuOpen = useUI((s) => s.menuOpen);

  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    l.on("scroll", (e: Lenis) => {
      ScrollTrigger.update();
      pulse.feed(e.velocity);
    });
    const raf = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Lenis is an external instance that only exists after mount.
    setLenis(l);
    return () => {
      gsap.ticker.remove(raf);
      l.destroy();
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [lenis, menuOpen]);

  const value = useMemo<ScrollApi>(() => ({
    lenis,
    scrollTo: (target, opts) => {
      if (lenis) {
        lenis.scrollTo(target, { immediate: opts?.immediate, offset: opts?.offset, duration: opts?.duration, force: true });
        return;
      }
      if (typeof target === "number") window.scrollTo({ top: target, behavior: "auto" });
      else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: "auto" });
      }
    },
  }), [lenis]);

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}
