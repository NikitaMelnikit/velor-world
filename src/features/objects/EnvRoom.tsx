"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product, ProductEnv } from "@/content/types";
import { MaterialTexture } from "@/components/media/MaterialTexture";

/**
 * Each object lives in its own weather. Switching objects doesn't swap a
 * card — the room itself is rebuilt: concrete, steel, wool, light.
 */
function EnvRoomImpl({ env }: { env: ProductEnv }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, ${env.bg} 0%, ${env.bg} 58%, ${env.bg2} 100%)` }}>
      {env.name === "concrete" && (
        <>
          <div className="absolute inset-0 opacity-45 mix-blend-multiply">
            <MaterialTexture kind="concrete" seed={3} />
          </div>
          {/* formwork panels */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.35) 1px, transparent 1px)",
              backgroundSize: "33.33vw 22vh",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,240,216,0.35),transparent_65%)]" />
        </>
      )}
      {env.name === "metal" && (
        <>
          <div className="absolute inset-0 opacity-20 mix-blend-screen">
            <MaterialTexture kind="steel" seed={5} />
          </div>
          <div
            className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ animation: "sheen 9s var(--ease-velor) infinite" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent to-black/50" />
          <div className="absolute inset-x-0 top-[62%] h-px bg-white/10" />
        </>
      )}
      {env.name === "soft" && (
        <>
          <div className="absolute inset-0 opacity-40 mix-blend-multiply">
            <MaterialTexture kind="wool" seed={7} />
          </div>
          <div className="absolute -left-[20%] -top-[30%] h-[110%] w-[80%] rounded-full bg-[radial-gradient(circle,rgba(255,220,170,0.55),transparent_62%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent to-[rgba(80,50,25,0.35)]" />
        </>
      )}
      {env.name === "light" && (
        <>
          <div className="absolute inset-0 opacity-35">
            <MaterialTexture kind="glass" seed={9} />
          </div>
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              className="absolute rounded-full bg-white/50 blur-3xl"
              style={{
                left: `${18 + k * 26}%`,
                top: `${20 + (k % 2) * 18}%`,
                width: "26vw",
                height: "12vw",
                animation: `caustic ${7 + k * 2}s ease-in-out ${k}s infinite alternate`,
              }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-[rgba(120,110,95,0.2)]" />
        </>
      )}
      <style>{`
        @keyframes sheen { 0% { transform: translateX(0) skewX(-18deg) } 60%,100% { transform: translateX(320%) skewX(-18deg) } }
        @keyframes caustic { from { transform: translate3d(-4vw, 0, 0) scale(1) } to { transform: translate3d(4vw, 3vh, 0) scale(1.25) } }
      `}</style>
    </div>
  );
}

export const EnvRoom = memo(EnvRoomImpl);

/** Environment transformation: the next room grows out of the centre of the current one. */
export function EnvStage({ product }: { product: Product }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.div
          key={product.slug}
          className="absolute inset-0"
          initial={{ clipPath: "circle(0% at 50% 55%)" }}
          animate={{ clipPath: "circle(145% at 50% 55%)" }}
          exit={{ opacity: 0.999, transition: { duration: 1.5 } }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
        >
          <EnvRoom env={product.env} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
