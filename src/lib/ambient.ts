/**
 * Optional real sound, synthesised — no audio assets are shipped.
 * Off by default; enabled only by an explicit user gesture (SOUND toggle).
 */

type ToneOpts = { freq: number; decay?: number; type?: OscillatorType; gain?: number };

class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = false;

  private boot() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Room tone: two low sines through a slowly breathing low-pass.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    filter.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const drone = ctx.createGain();
    drone.gain.value = 0.05;
    [55, 82.41, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      o.connect(filter);
      o.start();
    });
    filter.connect(drone).connect(master);

    // Air: filtered noise, barely there.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
    const air = ctx.createBufferSource();
    air.buffer = buffer;
    air.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 900;
    band.Q.value = 0.4;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.006;
    air.connect(band).connect(airGain).connect(master);
    air.start();

    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  enable() {
    const ctx = this.boot();
    if (!ctx || !this.master) return;
    void ctx.resume();
    this.enabled = true;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
  }

  disable() {
    if (!this.ctx || !this.master) return;
    this.enabled = false;
    const ctx = this.ctx;
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    window.setTimeout(() => {
      if (!this.enabled) void ctx.suspend();
    }, 1200);
  }

  tone({ freq, decay = 0.18, type = "sine", gain = 0.05 }: ToneOpts) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + decay + 0.05);
  }

  tick() {
    this.tone({ freq: 1320 + Math.random() * 180, decay: 0.05, type: "triangle", gain: 0.018 });
  }

  whoosh(duration = 0.9) {
    if (!this.enabled || !this.ctx || !this.master || !this.noise) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(180, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.6);
    f.frequency.exponentialRampToValueAtTime(300, t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + duration * 0.45);
    g.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.1);
  }
}

export const ambient = new Ambient();
