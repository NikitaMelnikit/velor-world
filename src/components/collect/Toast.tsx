"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Waveform } from "@/components/sound/Waveform";

export function Toast() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[85] flex justify-center px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0, clipPath: "inset(0 50% 0 50%)" }}
            animate={{ y: 0, opacity: 1, clipPath: "inset(0 0% 0 0%)" }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-5 bg-bone py-3 pl-4 pr-5 text-ink"
          >
            <span className="block h-6 w-10 text-ink">
              <Waveform mode="bars" bars={9} amp={0.7} freq={2} speed={1.6} reactive={false} />
            </span>
            <span className="flex flex-col">
              <span className="t-display text-sm">{toast.title}</span>
              {toast.meta && <span className="t-label opacity-60">{toast.meta}</span>}
            </span>
            <TransitionLink href="/collection" className="t-label border-l border-ink/20 pl-5 underline-offset-4 hover:underline">
              Open
            </TransitionLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
