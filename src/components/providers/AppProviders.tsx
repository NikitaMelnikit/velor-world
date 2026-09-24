"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { PulseClock } from "@/components/sound/SoundLayer";
import { useCollector } from "@/lib/store";

/** One place that composes the world's systems: scroll, transitions, pulse, memory. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCollector.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <TransitionProvider>
          <PulseClock />
          {children}
        </TransitionProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
