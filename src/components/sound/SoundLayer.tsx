"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { ambient } from "@/lib/ambient";
import { useCollector } from "@/lib/store";
import { Waveform } from "./Waveform";
import { cn } from "@/lib/utils";

/** Advances the pulse bus once per frame and routes pulses to optional real audio. */
export function PulseClock() {
  useEffect(() => {
    const step = (_t: number, dMs: number) => pulse.step(Math.min(0.1, dMs / 1000));
    gsap.ticker.add(step);
    const off = pulse.on((e) => {
      if (!ambient.enabled) return;
      if (e.kind === "tap") ambient.tick();
      if (e.kind === "collect") ambient.tone({ freq: 523.25, decay: 0.9, gain: 0.06 });
      if (e.kind === "tone" && e.freq) ambient.tone({ freq: e.freq, decay: e.decay ?? 0.6, gain: 0.08 });
    });
    return () => {
      gsap.ticker.remove(step);
      off();
    };
  }, []);
  return null;
}

/** HUD control: the world's "sound" is always visible; real audio is opt-in. */
export function SoundToggle({ className }: { className?: string }) {
  const sound = useCollector((s) => s.sound);
  const setSound = useCollector((s) => s.setSound);

  const toggle = () => {
    const next = !sound;
    setSound(next);
    if (next) ambient.enable();
    else ambient.disable();
    pulse.emit({ strength: 0.6, kind: "tap" });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor={sound ? "Mute" : "Listen"}
      aria-pressed={sound}
      aria-label={sound ? "Turn ambient sound off" : "Turn ambient sound on"}
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="block h-4 w-14">
        <Waveform mode="bars" bars={14} amp={sound ? 0.55 : 0.18} freq={1.4} speed={sound ? 1.2 : 0.5} />
      </span>
      <span className="t-label">
        Sound <span className={cn("transition-opacity", sound ? "opacity-100" : "opacity-45")}>{sound ? "On" : "Off"}</span>
      </span>
    </button>
  );
}
