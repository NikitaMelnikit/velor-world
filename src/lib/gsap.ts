"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export { gsap, ScrollTrigger };

/** Shared eases, so every room moves with the same accent. */
export const ease = {
  velor: "power4.inOut",
  out: "expo.out",
  in: "expo.in",
  soft: "sine.inOut",
} as const;
