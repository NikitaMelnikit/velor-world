import type { PlateSpec } from "./types";

export type ArchiveType = "Concept" | "Prototype" | "Sketch" | "Rejected" | "Photograph" | "Experiment";

export type ArchiveItem = {
  id: string;
  code: string;
  type: ArchiveType;
  title: string;
  text: string;
  status: string;
  plate?: PlateSpec;
  /** Renders a product elevation (sketch style) instead of a plate. */
  drawing?: string;
};

export type ArchiveYear = {
  year: number;
  title: string;
  line: string;
  era: { bg: string; fg: string; muted: string; accent: string; filter: string; label: string; paper: string };
  items: ArchiveItem[];
};

export const years: ArchiveYear[] = [
  {
    year: 2022,
    title: "The garage year",
    line: "Three people, one borrowed kiln, and a photocopier we used as a camera.",
    era: { bg: "#e9e5dc", fg: "#121211", muted: "#6d6a63", accent: "#121211", filter: "grayscale(1) contrast(1.35)", label: "Photocopy era", paper: "#f4f1ea" },
    items: [
      { id: "ar-22-001", code: "AR-22-001", type: "Photograph", title: "The first studio", text: "A rented garage in Rotterdam. The door didn't close, so we worked with the weather.", status: "Kept", plate: { kind: "window", tone: "bone", seed: 201 } },
      { id: "ar-22-002", code: "AR-22-002", type: "Sketch", title: "Lamp that points", text: "The first drawing that looks like SOLEN. Ballpoint pen on a train ticket.", status: "Became SOLEN", drawing: "solen" },
      { id: "ar-22-003", code: "AR-22-003", type: "Experiment", title: "Concrete in a milk carton", text: "Our first cast. We still don't know why it's pink.", status: "Kept on the shelf", plate: { kind: "monolith", tone: "bone", seed: 202 } },
      { id: "ar-22-004", code: "AR-22-004", type: "Rejected", title: "The name 'NORMAL'", text: "We almost called the brand NORMAL. We are very glad we didn't.", status: "Rejected" },
      { id: "ar-22-005", code: "AR-22-005", type: "Concept", title: "Object manifesto", text: "Seven rules on one A4 sheet. Rule 1: an object must have a point of view.", status: "Still pinned up", plate: { kind: "columns", tone: "bone", seed: 203 } },
    ],
  },
  {
    year: 2023,
    title: "The first object",
    line: "SOLEN ships. Three hundred pieces, every base poured by hand.",
    era: { bg: "#1b2226", fg: "#dfe7ea", muted: "#7f9199", accent: "#b9ccd4", filter: "grayscale(0.6) sepia(0.2) hue-rotate(170deg) saturate(1.4)", label: "Blueprint era", paper: "#232c31" },
    items: [
      { id: "ar-23-001", code: "AR-23-001", type: "Prototype", title: "SOLEN P-9", text: "The ninth base pour. The first one that felt like an argument.", status: "Production", drawing: "solen" },
      { id: "ar-23-002", code: "AR-23-002", type: "Photograph", title: "Launch night", text: "Forty people, one lamp, a warehouse in Antwerp. It rained through the roof.", status: "Kept", plate: { kind: "shaft", tone: "night", seed: 211 } },
      { id: "ar-23-003", code: "AR-23-003", type: "Rejected", title: "SOLEN floor version", text: "Two metres of brass arm. It could reach across a room and it frightened everyone.", status: "Rejected" },
      { id: "ar-23-004", code: "AR-23-004", type: "Experiment", title: "Brass patina study", text: "Twelve brass rods held by twelve people for a month. Everyone's hands age metal differently.", status: "Informed finish", plate: { kind: "columns", tone: "steel", seed: 212 } },
      { id: "ar-23-005", code: "AR-23-005", type: "Sketch", title: "A folded table", text: "Napkin sketch from a café in Porto. Nobody knew yet that it was KERF.", status: "Became KERF", drawing: "kerf" },
    ],
  },
  {
    year: 2024,
    title: "Metal and patience",
    line: "Fourteen kerf patterns, thirteen broken tables, one that held.",
    era: { bg: "#c9b99c", fg: "#221a10", muted: "#6c5a42", accent: "#6d3b1f", filter: "sepia(0.7) contrast(1.05)", label: "Polaroid era", paper: "#efe5d2" },
    items: [
      { id: "ar-24-001", code: "AR-24-001", type: "Prototype", title: "KERF pattern 9", text: "Beautiful, and it bent like a hand of cards. Pattern 14 was the one.", status: "Failed", drawing: "kerf" },
      { id: "ar-24-002", code: "AR-24-002", type: "Photograph", title: "The press brake", text: "The only machine in the studio with a name. It's called Agnes.", status: "Kept", plate: { kind: "stairs", tone: "sand", seed: 221 } },
      { id: "ar-24-003", code: "AR-24-003", type: "Concept", title: "Material library", text: "Ilse's bench becomes a room. 340 samples, each with a diary.", status: "Ongoing", plate: { kind: "strata", tone: "sand", seed: 222 } },
      { id: "ar-24-004", code: "AR-24-004", type: "Rejected", title: "Green marble", text: "It stained if you breathed on it. It punished people for living.", status: "Rejected", plate: { kind: "strata", tone: "sepia", seed: 223 } },
      { id: "ar-24-005", code: "AR-24-005", type: "Experiment", title: "Sound of steel", text: "We recorded how every sheet rings. Now we choose steel with our ears.", status: "Method", plate: { kind: "horizon", tone: "sand", seed: 224 } },
    ],
  },
  {
    year: 2025,
    title: "Softness",
    line: "The first object you sit in. Two hundred posture studies, one angle.",
    era: { bg: "#2a2622", fg: "#eee6da", muted: "#9b8f80", accent: "#d7b98c", filter: "saturate(0.5) contrast(1.1)", label: "Render era", paper: "#35302a" },
    items: [
      { id: "ar-25-001", code: "AR-25-001", type: "Sketch", title: "Posture study 117", text: "A person reading, drawn from above. The chair appears around them later.", status: "Became HALDEN", drawing: "halden" },
      { id: "ar-25-002", code: "AR-25-002", type: "Prototype", title: "Back angle rig", text: "An adjustable wooden rig. 104° was where people stopped talking.", status: "Measured", plate: { kind: "columns", tone: "dusk", seed: 231 } },
      { id: "ar-25-003", code: "AR-25-003", type: "Photograph", title: "Wool, boiled", text: "The Casentino mill. The cloth steams for six hours.", status: "Kept", plate: { kind: "window", tone: "dusk", seed: 232 } },
      { id: "ar-25-004", code: "AR-25-004", type: "Rejected", title: "HALDEN with arms", text: "Arms made it a throne. We wanted a hiding place.", status: "Rejected", drawing: "halden" },
      { id: "ar-25-005", code: "AR-25-005", type: "Experiment", title: "Latex densities", text: "Seven densities, stacked in every order. Firm, forgiving, soft won.", status: "Method", plate: { kind: "strata", tone: "dusk", seed: 233 } },
    ],
  },
  {
    year: 2026,
    title: "Emptiness",
    line: "VAEL, and the first things we can't build yet.",
    era: { bg: "#0f0f0e", fg: "#e7e2d7", muted: "#8a867d", accent: "#c7aa74", filter: "none", label: "Present", paper: "#181816" },
    items: [
      { id: "ar-26-001", code: "AR-26-001", type: "Prototype", title: "VAEL — first gather", text: "Blown in Murano. The profile moved 3 mm and we remade everything.", status: "Production", drawing: "vael" },
      { id: "ar-26-002", code: "AR-26-002", type: "Photograph", title: "Travertine block", text: "Tivoli, February. One block became 90 feet and 90 lids.", status: "Kept", plate: { kind: "strata", tone: "bone", seed: 241 } },
      { id: "ar-26-003", code: "AR-26-003", type: "Concept", title: "This website", text: "We designed the world as a building before we drew a single page.", status: "You're in it", plate: { kind: "arches", tone: "night", seed: 242 } },
      { id: "ar-26-004", code: "AR-26-004", type: "Experiment", title: "Mycelium light", text: "A lampshade grown in eleven days. It moved to FUTURE.", status: "→ Future", plate: { kind: "shaft", tone: "night", seed: 243 } },
      { id: "ar-26-005", code: "AR-26-005", type: "Rejected", title: "VAEL, coloured", text: "Amber glass looked like a museum piece. Clear looked like a thought.", status: "Rejected", drawing: "vael" },
    ],
  },
];

export type Unbuilt = { id: string; name: string; year: number; reason: string; lesson: string; plate: PlateSpec };

export const unbuilt: Unbuilt[] = [
  { id: "idea-mirror", name: "A mirror that ages", year: 2022, reason: "Silvering that tarnishes on purpose. Customers returned it thinking it was broken.", lesson: "Honesty needs explanation.", plate: { kind: "horizon", tone: "sepia", seed: 301 } },
  { id: "idea-bench", name: "The two-hour bench", year: 2023, reason: "Comfortable for exactly two hours, then the seat slowly tilts. Too clever. Slightly cruel.", lesson: "Never design against the user.", plate: { kind: "columns", tone: "sepia", seed: 302 } },
  { id: "idea-clock", name: "A clock with no hands", year: 2023, reason: "Tells time with the angle of shadow alone. Beautiful for eleven hours a day.", lesson: "An object must work at night too.", plate: { kind: "shaft", tone: "sepia", seed: 303 } },
  { id: "idea-door", name: "The heavy door handle", year: 2024, reason: "Four kilograms of bronze. Children couldn't open doors with it.", lesson: "Weight is a privilege of the strong.", plate: { kind: "monolith", tone: "sepia", seed: 304 } },
  { id: "idea-shelf", name: "A shelf that holds one book", year: 2024, reason: "We loved it. Everyone asked where the other books should go.", lesson: "A point of view is not a lecture.", plate: { kind: "stairs", tone: "sepia", seed: 305 } },
  { id: "idea-lamp", name: "The lamp that listens", year: 2025, reason: "Dimmed when the room went quiet. It felt like being watched.", lesson: "Objects should notice, not surveil.", plate: { kind: "window", tone: "sepia", seed: 306 } },
];
