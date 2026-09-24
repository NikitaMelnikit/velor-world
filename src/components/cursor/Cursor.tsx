"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { useMediaQuery, useReducedMotion } from "@/hooks";

const INTERACTIVE = "[data-cursor], a, button, [role=button], select, label, summary";

/**
 * A cursor that listens. It names what you're about to do ("Enter", "Drag",
 * "Collect"), ripples on every press and feeds the pulse bus. Fine pointers only;
 * touch devices keep their native, direct interaction.
 */
export function Cursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!fine || !dot.current || !ring.current || !root.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const r = ring.current;
    const d = dot.current;
    const layer = root.current;

    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const rx = gsap.quickTo(r, "x", { duration: reduced ? 0.01 : 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: reduced ? 0.01 : 0.45, ease: "power3" });
    let current: Element | null = null;

    const move = (e: PointerEvent) => {
      gsap.set(d, { x: e.clientX, y: e.clientY });
      rx(e.clientX);
      ry(e.clientY);
      layer.style.opacity = "1";
    };

    const over = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const field = target?.closest("input, textarea, [contenteditable=true]");
      const el = field ? null : target?.closest(INTERACTIVE);
      if (field) {
        r.dataset.state = "hidden";
        return;
      }
      if (el === current) return;
      current = el ?? null;
      if (!el) {
        r.dataset.state = "idle";
        if (label.current) label.current.textContent = "";
        return;
      }
      const text = el.getAttribute("data-cursor") ?? (el.tagName === "A" ? "Enter" : "");
      r.dataset.state = text ? "label" : "hover";
      if (label.current) label.current.textContent = text;
      pulse.emit({ strength: 0.06, kind: "hover" });
    };

    const down = (e: PointerEvent) => {
      gsap.to(r, { scale: 0.82, duration: 0.2, ease: "power2.out" });
      pulse.emit({ strength: 0.35, kind: "tap", x: e.clientX, y: e.clientY });
      if (reduced) return;
      const ripple = document.createElement("span");
      ripple.className = "pointer-events-none absolute left-0 top-0 size-12 rounded-full border border-bone/70";
      layer.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0.8 },
        { scale: 2.8, opacity: 0, duration: 0.9, ease: "expo.out", onComplete: () => ripple.remove() },
      );
    };
    const up = () => gsap.to(r, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    const leave = (e: PointerEvent) => {
      if (!e.relatedTarget) layer.style.opacity = "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerout", leave);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[100] opacity-0 transition-opacity duration-300" aria-hidden>
      <div
        ref={ring}
        data-state="idle"
        className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-bone/60 mix-blend-difference transition-[width,height,background-color,border-color,opacity] duration-500 ease-[var(--ease-expo)] data-[state=hidden]:opacity-0 data-[state=hover]:size-14 data-[state=hover]:border-bone data-[state=label]:size-[5.5rem] data-[state=label]:border-transparent data-[state=label]:bg-bone data-[state=label]:mix-blend-normal"
      >
        <span ref={label} className="t-label px-2 text-center text-[0.6rem] leading-tight text-ink" />
      </div>
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-bone mix-blend-difference" />
    </div>
  );
}
