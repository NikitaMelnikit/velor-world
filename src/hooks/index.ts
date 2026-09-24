"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { useReducedMotion as useFMReducedMotion } from "framer-motion";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** OS-level reduced motion. `false` during SSR and hydration, so markup always matches. */
export function useReducedMotion() {
  const mounted = useMounted();
  const reduced = useFMReducedMotion() ?? false;
  return mounted && reduced;
}

export function useMediaQuery(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

/** Touch-first devices get a separate interaction model, not a shrunk one. */
export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)");
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Lazy mount: true once the element comes within `margin` of the viewport.
 * With `unmount`, flips back to false when it leaves — used to keep only one
 * WebGL context alive per page.
 */
export function useNearViewport<T extends Element>(ref: RefObject<T | null>, margin = "300px", unmount = false) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        else if (unmount) setNear(false);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, unmount]);
  return near;
}

/** Pointer position normalised to [-1, 1] relative to the viewport, stored in a ref (no re-renders). */
export function usePointerRef() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  return pointer;
}

/** Visibility of the document — loops pause in background tabs. */
export function usePageVisible() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener("visibilitychange", cb);
      return () => document.removeEventListener("visibilitychange", cb);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
}
