/**
 * The pulse bus — VELOR's "sound" without sound.
 *
 * Every interaction emits a pulse. Visual meters (HUD waveform, chapter
 * waveforms, the cursor ripple) read the decaying `energy` inside the shared
 * GSAP ticker, so nothing here causes React re-renders.
 */

export type PulseKind = "tap" | "hover" | "nav" | "collect" | "scroll" | "tone";

export type PulseEvent = {
  strength: number;
  kind: PulseKind;
  x?: number;
  y?: number;
  /** Optional tone hint for the WebAudio layer (Hz). */
  freq?: number;
  decay?: number;
};

type Listener = (e: PulseEvent) => void;

const listeners = new Set<Listener>();
let energy = 0;
let scrollEnergy = 0;

export const pulse = {
  emit(e: PulseEvent) {
    energy = Math.min(1.6, energy + e.strength);
    listeners.forEach((l) => l(e));
  },
  on(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Feed continuous signals (scroll velocity). Normalised internally. */
  feed(velocity: number) {
    scrollEnergy = Math.min(1, Math.max(scrollEnergy, Math.abs(velocity) / 40));
  },
  /** Called once per frame by whoever renders a meter. Idempotent per frame. */
  step(dt: number) {
    const k = Math.pow(0.05, dt);
    energy *= k;
    scrollEnergy *= Math.pow(0.2, dt);
  },
  get energy() {
    return energy + scrollEnergy * 0.6;
  },
};
