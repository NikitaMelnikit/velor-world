/* Origin chapters, Atelier stages and Future concepts. */

export type Chapter = {
  id: string;
  n: string;
  year: string;
  title: string;
  line: string;
  text: string;
  /** Waveform character: the "sound" of the chapter. */
  wave: { amp: number; freq: number; noise: number; speed: number };
};

export const chapters: Chapter[] = [
  {
    id: "question",
    n: "01",
    year: "2016",
    title: "THE QUESTION",
    line: "What if an object could hold an opinion?",
    text: "A studio apartment, one lamp that lit everything equally and nothing well. The question was written on the back of an envelope and stayed on the fridge for two years.",
    wave: { amp: 0.08, freq: 1.2, noise: 0, speed: 0.4 },
  },
  {
    id: "experiment",
    n: "02",
    year: "2018",
    title: "THE EXPERIMENT",
    line: "412 prototypes. One table. One window.",
    text: "Foam, plaster, aluminium, concrete, glass. Every object photographed on the same table under the same light, so the only variable was the idea.",
    wave: { amp: 0.35, freq: 6, noise: 0.15, speed: 1.4 },
  },
  {
    id: "failure",
    n: "03",
    year: "2018",
    title: "THE FAILURE",
    line: "Four hundred and eleven of them didn't work.",
    text: "Bases cracked, arms bent, glass shattered in the kiln. By December the studio was out of money and almost out of patience.",
    wave: { amp: 0.7, freq: 3, noise: 0.85, speed: 2.6 },
  },
  {
    id: "discovery",
    n: "04",
    year: "2019",
    title: "THE DISCOVERY",
    line: "The flaw was the form.",
    text: "Prototype 311 cracked for the second time. Nobody sanded it. The next morning, everyone agreed: the crack was better than anything we'd designed on purpose.",
    wave: { amp: 0.45, freq: 2, noise: 0, speed: 0.8 },
  },
  {
    id: "object",
    n: "05",
    year: "2021",
    title: "THE OBJECT",
    line: "SOLEN. Eleven parts, no glue, one point of view.",
    text: "The first object that did what the envelope asked: it chose one surface in a room and lit it completely.",
    wave: { amp: 0.25, freq: 1, noise: 0, speed: 0.5 },
  },
  {
    id: "brand",
    n: "06",
    year: "2022",
    title: "THE BRAND",
    line: "Objects with a point of view.",
    text: "VELOR was named after the object, not the other way round. Every piece since has had to answer the same question from the fridge.",
    wave: { amp: 0.3, freq: 1.5, noise: 0.05, speed: 0.6 },
  },
];

export type AtelierStage = {
  id: string;
  n: string;
  title: string;
  weeks: string;
  process: { text: string; figure: "board" | "sketch" | "blocks" | "chips" | "drawing" | "final" };
  material: { texture: "paper" | "graphite" | "plaster" | "concrete" | "steel" | "brass"; caption: string };
  person: { name: string; role: string; quote: string; story: string; seed: number };
};

export const stages: AtelierStage[] = [
  {
    id: "research",
    n: "01",
    title: "RESEARCH",
    weeks: "Weeks 1–6",
    process: { text: "Before shapes, questions. Who touches this object, how often, in what light? We fill a wall with references, measurements and failures of other people.", figure: "board" },
    material: { texture: "paper", caption: "Macro ×40 — Cotton rag paper, 300 gsm" },
    person: { name: "Ilse Brandvold", role: "Head of Research", quote: "I don't collect images. I collect behaviours.", story: "Ilse spent a month photographing how people pick up lamps in cafés. Only four of 212 used the switch the designer intended.", seed: 401 },
  },
  {
    id: "sketch",
    n: "02",
    title: "SKETCH",
    weeks: "Weeks 6–10",
    process: { text: "Charcoal first, never software. A sketch that takes longer than a minute is already too precious to throw away.", figure: "sketch" },
    material: { texture: "graphite", caption: "Macro ×60 — Compressed charcoal on newsprint" },
    person: { name: "Teo Marchetti", role: "Industrial Designer", quote: "If I can't draw it in one breath, it's not one idea.", story: "Teo draws with his left hand when he's stuck. He says it stops him from being clever.", seed: 402 },
  },
  {
    id: "prototype",
    n: "03",
    title: "PROTOTYPE",
    weeks: "Weeks 10–24",
    process: { text: "Foam, plaster, cardboard, then the real thing. Each prototype answers exactly one question and is then allowed to fail.", figure: "blocks" },
    material: { texture: "plaster", caption: "Macro ×25 — Plaster of Paris, hand-carved" },
    person: { name: "Mara Quist", role: "Model Maker", quote: "A prototype is a question you can hold.", story: "Mara keeps every failed model in labelled boxes. There are 1,400 of them in the basement.", seed: 403 },
  },
  {
    id: "material",
    n: "04",
    title: "MATERIAL",
    weeks: "Weeks 16–30",
    process: { text: "Samples live on the research bench for six weeks minimum: tapped, soaked, sun-bleached, handled. Nothing is chosen from a photograph.", figure: "chips" },
    material: { texture: "concrete", caption: "Macro ×30 — Fibre concrete, day 28 of cure" },
    person: { name: "Noor Halabi", role: "Material Scientist", quote: "Every material has a worst day. I want to meet it first.", story: "Noor left a concrete sample on her roof for an entire winter. It's now the reference for every SOLEN base.", seed: 404 },
  },
  {
    id: "engineering",
    n: "05",
    title: "ENGINEERING",
    weeks: "Weeks 24–40",
    process: { text: "Tolerances, loads, cable routes, repairability. The object is taken apart on paper until every part can be replaced by hand.", figure: "drawing" },
    material: { texture: "steel", caption: "Macro ×80 — Brushed stainless, 240 grit" },
    person: { name: "Lieve Brandt", role: "Engineer", quote: "Good engineering is the part nobody will ever thank you for.", story: "Lieve's rule: if a part needs a special tool to remove, it's a design mistake. She has vetoed 31 screws.", seed: 405 },
  },
  {
    id: "final",
    n: "06",
    title: "FINAL OBJECT",
    weeks: "Week 40 →",
    process: { text: "The object leaves the atelier signed and numbered — with a service promise that outlives its warranty.", figure: "final" },
    material: { texture: "brass", caption: "Macro ×20 — Solid brass, first touch" },
    person: { name: "Aurelie Sten", role: "Creative Director", quote: "The object is finished when it stops explaining itself.", story: "Aurelie signs every piece by hand. She has signed 1,184 so far and says the signature is getting worse on purpose.", seed: 406 },
  },
];

export type Concept = {
  slug: string;
  code: string;
  name: string;
  status: "PROTOTYPE" | "SPECULATIVE" | "UNFINISHED" | "IN GROWTH" | "IMPOSSIBLE";
  line: string;
  text: string;
  hint: string;
  widget: "breathing" | "memory" | "mycelium" | "unfinished" | "gravity" | "liquid";
};

export const concepts: Concept[] = [
  {
    slug: "breathing-wall",
    code: "FX-01",
    name: "Breathing Wall",
    status: "PROTOTYPE",
    line: "An acoustic panel that inhales when you come close.",
    text: "Felt cells on a flexible lattice expand toward sound and presence, softening a room exactly where people gather.",
    hint: "Move close",
    widget: "breathing",
  },
  {
    slug: "memory-surface",
    code: "FX-02",
    name: "Memory Surface",
    status: "SPECULATIVE",
    line: "A tabletop that remembers where you touched it — and slowly forgets.",
    text: "Thermochromic lacquer holds the trace of hands for a few minutes. A record of attention, deliberately temporary.",
    hint: "Draw on it",
    widget: "memory",
  },
  {
    slug: "mycelium-light",
    code: "FX-03",
    name: "Mycelium Light",
    status: "IN GROWTH",
    line: "A shade grown, not made. Eleven days from spore to lamp.",
    text: "Mycelium grows through hemp in a mould, then is baked to stop it. Every shade has a different growth pattern.",
    hint: "Seed it",
    widget: "mycelium",
  },
  {
    slug: "vessel-null",
    code: "FX-04",
    name: "Vessel ∅",
    status: "UNFINISHED",
    line: "████████ ████ ███ ██████.",
    text: "We don't know what this is yet. Render stopped at 73%. Keeping it here as a reminder that not every idea has to arrive.",
    hint: "Try to finish it",
    widget: "unfinished",
  },
  {
    slug: "gravity-shelf",
    code: "FX-05",
    name: "Gravity Shelf",
    status: "PROTOTYPE",
    line: "A shelf with no fixings. Objects hold each other in place.",
    text: "Every piece is balanced against the next. Remove the wrong one and the shelf quietly rearranges itself.",
    hint: "Drag the pieces",
    widget: "gravity",
  },
  {
    slug: "liquid-stone",
    code: "FX-06",
    name: "Liquid Stone",
    status: "IMPOSSIBLE",
    line: "A material that is stone until you need it not to be.",
    text: "Non-Newtonian mineral composites exist in labs. A stone that flows around your hand does not. Yet.",
    hint: "Stir it",
    widget: "liquid",
  },
];
