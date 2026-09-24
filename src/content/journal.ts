import type { PlateSpec } from "./types";

export type JournalCategory =
  | "Interview"
  | "Essay"
  | "Behind the scenes"
  | "Architecture"
  | "Culture"
  | "Design"
  | "Visual story";

type Base = {
  slug: string;
  title: string;
  dek: string;
  category: JournalCategory;
  author: string;
  date: string;
  read: string;
  cover: PlateSpec;
};

export type EssayArticle = Base & {
  layout: "essay";
  pull: string;
  body: { p: string; note?: string }[];
};

export type InterviewArticle = Base & {
  layout: "interview";
  subject: { name: string; role: string; initials: string };
  intro: string;
  pull: string;
  qa: { q: string; a: string }[];
};

export type ContactArticle = Base & {
  layout: "contact";
  intro: string;
  frames: { code: string; time: string; caption: string; plate: PlateSpec; marked?: boolean }[];
  outro: string;
};

export type HorizontalArticle = Base & {
  layout: "horizontal";
  intro: string;
  plates: { title: string; text: string; plate?: PlateSpec; plan?: number }[];
};

export type ManifestoArticle = Base & {
  layout: "manifesto";
  chapters: { n: string; title: string; text: string }[];
};

export type VisualArticle = Base & {
  layout: "visual";
  frames: { plate: PlateSpec; caption: string; text?: string }[];
};

export type AnatomyArticle = Base & {
  layout: "anatomy";
  product: string;
  intro: string;
  notes: { part: string; title: string; text: string }[];
};

export type Article =
  | EssayArticle
  | InterviewArticle
  | ContactArticle
  | HorizontalArticle
  | ManifestoArticle
  | VisualArticle
  | AnatomyArticle;

export const issue = { number: "07", season: "Autumn 2026", theme: "On Weight" };

export const articles: Article[] = [
  {
    slug: "the-weight-of-light",
    layout: "essay",
    category: "Essay",
    title: "The Weight of Light",
    dek: "Why the heaviest part of a lamp might be the most important thing about the light it makes.",
    author: "Aurelie Sten",
    date: "September 2026",
    read: "8 min",
    cover: { kind: "shaft", tone: "dusk", seed: 21 },
    pull: "We trust light that seems to come from something heavier than itself.",
    body: [
      { p: "Pick up a good lamp before you switch it on. Not to admire it — to feel where its weight lives. In most lamps it lives nowhere in particular. The body is a hollow shell around a cable, and the whole object weighs about as much as a paperback. It looks solid in photographs. In the hand it confesses." },
      { p: "When we began SOLEN we were not thinking about light at all. We were thinking about the moment a hand reaches over a table and adjusts a lamp without looking. That gesture only works if the base doesn't move. It needs mass — not as decoration, but as a promise.", note: "The first SOLEN prototype weighed 900 g. It fell over eleven times in its first week in the studio." },
      { p: "Heavy objects make us slow down. We lift them with two hands, we set them down carefully, we remember where they are. A heavy lamp stays where you put it for years, and the light it throws becomes part of the architecture of the room rather than a feature of the furniture." },
      { p: "There is something older at work too. For most of history, light came from things that were heavy: a hearth built from stone, an oil lamp carved from clay, a candle in an iron holder. The weight of the source was a measure of how long the light would last.", note: "Roman bronze oil lamps were routinely weighted with lead in the base — a detail almost identical to the iron ballast hidden in SOLEN." },
      { p: "We trust light that seems to come from something heavier than itself. It feels anchored, deliberate, unlikely to flicker out. A featherweight lamp, however bright, reads as temporary." },
      { p: "So the concrete base of SOLEN is not there to look industrial. It is there because when you touch the arm and the lamp doesn't move, you trust it with something. You leave it on while you read. You let it define the edge of the evening." },
      { p: "Light has no weight. But the way we receive it — the feeling that a room has settled, that the day has ended properly — depends almost entirely on what the light is attached to." },
    ],
  },
  {
    slug: "listening-to-materials",
    layout: "interview",
    category: "Interview",
    title: "Listening to Materials",
    dek: "Ilse Brandvold on tapping stone, smelling steel, and why she never trusts a photograph of a sample.",
    author: "VELOR Journal",
    date: "August 2026",
    read: "11 min",
    cover: { kind: "portrait", tone: "night", seed: 31 },
    subject: { name: "Ilse Brandvold", role: "Head of Research", initials: "IB" },
    intro:
      "Ilse Brandvold runs research at VELOR. Before an object has a shape, it has a material — and before a material is chosen, it spends weeks on Ilse's bench being tapped, scratched, warmed, soaked and left in the sun. We met her there.",
    pull: "A photograph tells you what a material looks like on its best day. I want to know about its worst.",
    qa: [
      { q: "What is the first thing you do when a new sample arrives?", a: "I knock on it. Before I look at it properly, before I read the data sheet. The sound tells me about density and about internal flaws faster than any instrument. Stone that rings is stone that's whole." },
      { q: "You're known for refusing to choose materials from photographs.", a: "A photograph tells you what a material looks like on its best day. I want to know about its worst. What does it do after ten years of hands? After someone spills wine on it? After a winter by a window?" },
      { q: "How long does a material live on your bench?", a: "Minimum six weeks. Some stay for years. There's a piece of oak there now that has been drying since 2022. It's not for any project. I just want to know what it becomes." },
      { q: "Is there a material you've rejected that still haunts you?", a: "A beautiful green marble from a small quarry in Greece. It photographed like a dream. But it stained if you breathed on it. We would have been selling people something that punished them for living." },
      { q: "What does 'honest material' actually mean to you?", a: "It means the material behaves the way it looks. If something looks heavy, it's heavy. If it looks warm, it's warm to the touch. The worst objects are the ones that lie to your hand." },
      { q: "Last question. Which material do you trust the most?", a: "Wool. It's been keeping people alive for ten thousand years and it has never once pretended to be anything else." },
    ],
  },
  {
    slug: "412-prototypes",
    layout: "contact",
    category: "Behind the scenes",
    title: "412 Prototypes",
    dek: "A contact sheet from the year we failed at almost everything — and the one frame that changed the studio.",
    author: "Teo Marchetti",
    date: "July 2026",
    read: "5 min",
    cover: { kind: "window", tone: "sepia", seed: 41 },
    intro:
      "Between March 2018 and February 2019 we built four hundred and twelve prototypes of objects that did not yet have names. Most of them were photographed once, on the same table, under the same window. These are twelve of those frames. One is circled.",
    frames: [
      { code: "P-004", time: "03.03.18 — 09:12", caption: "Foam study for a lamp base. Too light, too polite.", plate: { kind: "studio", tone: "sepia", seed: 101 } },
      { code: "P-031", time: "21.03.18 — 16:40", caption: "First poured concrete. Cracked overnight.", plate: { kind: "monolith", tone: "sepia", seed: 102 } },
      { code: "P-058", time: "11.04.18 — 11:05", caption: "Folded aluminium — collapsed under a coffee cup.", plate: { kind: "stairs", tone: "sepia", seed: 103 } },
      { code: "P-102", time: "02.06.18 — 14:22", caption: "Glass test. The kiln was two degrees too hot.", plate: { kind: "shaft", tone: "sepia", seed: 104 } },
      { code: "P-147", time: "19.07.18 — 08:51", caption: "A chair with no back. Nobody sat in it twice.", plate: { kind: "columns", tone: "sepia", seed: 105 } },
      { code: "P-188", time: "30.08.18 — 18:03", caption: "Oak and felt. Almost. The joint squeaked.", plate: { kind: "window", tone: "sepia", seed: 106 } },
      { code: "P-233", time: "04.10.18 — 10:30", caption: "Stone vessel. Beautiful. Leaked.", plate: { kind: "arches", tone: "sepia", seed: 107 } },
      { code: "P-276", time: "15.11.18 — 13:14", caption: "A lamp that could only point at the floor.", plate: { kind: "studio", tone: "sepia", seed: 108 } },
      { code: "P-311", time: "07.12.18 — 17:48", caption: "Concrete base, second crack. We stopped sanding it.", plate: { kind: "strata", tone: "sepia", seed: 109 }, marked: true },
      { code: "P-356", time: "09.01.19 — 09:37", caption: "The crack, cast deliberately. It held.", plate: { kind: "monolith", tone: "sepia", seed: 110 } },
      { code: "P-398", time: "01.02.19 — 12:02", caption: "Brass arm, first version. Too long by 8 cm.", plate: { kind: "horizon", tone: "sepia", seed: 111 } },
      { code: "P-412", time: "26.02.19 — 19:20", caption: "The last prototype. The first object.", plate: { kind: "studio", tone: "sepia", seed: 112 } },
    ],
    outro:
      "P-311 is the frame we come back to. A base had cracked for the second time, and instead of throwing it away somebody left it on the table. By the next morning the whole studio agreed: the crack was better than anything we had designed on purpose.",
  },
  {
    slug: "rooms-without-doors",
    layout: "horizontal",
    category: "Architecture",
    title: "Rooms Without Doors",
    dek: "On thresholds — and the buildings that taught us to design a website like a sequence of rooms.",
    author: "Jonas Weil",
    date: "June 2026",
    read: "7 min",
    cover: { kind: "arches", tone: "bone", seed: 51 },
    intro:
      "The best buildings never tell you where one room ends and the next begins. They use light, compression and material to move you forward. Six thresholds we keep returning to — drawn, photographed and described.",
    plates: [
      { title: "The compressed entry", text: "A low, dark passage before a high, bright room. You don't notice the ceiling rise; you notice yourself exhale.", plan: 1 },
      { title: "Light at the end", text: "People walk towards light the way plants grow towards it. A bright far wall is the only signage a corridor needs.", plate: { kind: "arches", tone: "night", seed: 52 } },
      { title: "The turned corner", text: "Hide the destination. A single 90° turn turns a hallway into a story with a reveal.", plan: 2 },
      { title: "Material changes", text: "Stone underfoot becomes timber. Nobody tells you that you've entered a private room — your feet do.", plate: { kind: "strata", tone: "sand", seed: 53 } },
      { title: "The enfilade", text: "A line of doorways, perfectly aligned. You can see five rooms ahead and the building invites you through all of them.", plan: 3 },
      { title: "The window seat", text: "The last room is always the smallest: a place to stop, sit, and look back at where you came from.", plate: { kind: "window", tone: "bone", seed: 54 } },
    ],
  },
  {
    slug: "a-brief-history-of-sitting-still",
    layout: "manifesto",
    category: "Culture",
    title: "A Brief History of Sitting Still",
    dek: "Five chapters on the chair as a political, domestic and deeply personal object.",
    author: "Noor Halabi",
    date: "May 2026",
    read: "9 min",
    cover: { kind: "columns", tone: "sand", seed: 61 },
    chapters: [
      { n: "I", title: "The throne", text: "For most of history, sitting was a privilege. The chair belonged to whoever held power; everyone else stood, knelt or sat on the floor. To be offered a chair was to be offered status." },
      { n: "II", title: "The kitchen", text: "Then the chair came home. Farmhouse chairs, rush seats, the ladder-back by the stove — furniture for resting between tasks, never for staying." },
      { n: "III", title: "The office", text: "The twentieth century made sitting a job. Chairs learned to roll, swivel and adjust, all in the service of keeping a body productive for eight hours." },
      { n: "IV", title: "The screen", text: "Now we sit more than any people in history, and rest less. We sit to scroll, to answer, to watch. The chair became a waiting room for the next notification." },
      { n: "V", title: "The proposal", text: "A lounge chair today is a small act of resistance. It proposes an hour with nothing in it. That is the only brief HALDEN was ever given." },
    ],
  },
  {
    slug: "concrete-seen-slowly",
    layout: "visual",
    category: "Visual story",
    title: "Concrete, Seen Slowly",
    dek: "Six photographs of one wall, taken across a single day.",
    author: "Mara Quist",
    date: "April 2026",
    read: "3 min",
    cover: { kind: "monolith", tone: "bone", seed: 71 },
    frames: [
      { plate: { kind: "horizon", tone: "steel", seed: 72 }, caption: "05:48 — Before sunrise, concrete is blue.", text: "We photographed the same wall from the same tripod for a whole day in June." },
      { plate: { kind: "shaft", tone: "sand", seed: 73 }, caption: "08:15 — The first raking light finds every pore." },
      { plate: { kind: "monolith", tone: "bone", seed: 74 }, caption: "12:30 — Noon flattens everything. The wall disappears.", text: "At midday the most expressive material in the world looks like nothing at all." },
      { plate: { kind: "window", tone: "sand", seed: 75 }, caption: "16:40 — Shadows of the window frame move across it like a clock." },
      { plate: { kind: "arches", tone: "dusk", seed: 76 }, caption: "20:05 — Warm light. The grey remembers it was once sand." },
      { plate: { kind: "stairs", tone: "night", seed: 77 }, caption: "22:30 — Only the texture remains.", text: "This is why SOLEN's base is concrete: it is never the same colour twice." },
    ],
  },
  {
    slug: "anatomy-of-a-knuckle",
    layout: "anatomy",
    category: "Design",
    title: "Anatomy of a Knuckle",
    dek: "Eleven parts, one gesture. A close reading of the SOLEN table light.",
    author: "Lieve Brandt",
    date: "March 2026",
    read: "6 min",
    cover: { kind: "studio", tone: "night", seed: 81 },
    product: "solen",
    intro:
      "Every object is an argument made of parts. Here is SOLEN, taken apart on paper — each component and the one decision it represents.",
    notes: [
      { part: "base", title: "The anchor", text: "Concrete, 4.2 kg. Heavy enough that the lamp never follows your hand." },
      { part: "dimmer", title: "The count", text: "Twenty-four detents. Light becomes a number you can remember." },
      { part: "stem", title: "The line", text: "Solid brass, turned from bar. It will darken exactly where you touch it most." },
      { part: "knuckle", title: "The joint", text: "Friction, not springs. Nothing to wear out, nothing to snap." },
      { part: "arm", title: "The reach", text: "64 cm. Long enough to reach the middle of a table, short enough to stay intimate." },
      { part: "shade", title: "The veil", text: "Acid-etched opal glass. You see light, never the source of it." },
    ],
  },
];

export const categories: JournalCategory[] = [
  "Interview",
  "Essay",
  "Behind the scenes",
  "Architecture",
  "Culture",
  "Design",
  "Visual story",
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
