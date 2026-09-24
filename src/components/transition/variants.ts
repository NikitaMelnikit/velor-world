/**
 * Moving between rooms is never a page load. Specific room pairs have
 * their own material metamorphosis; everything else passes through doors.
 */

export type TransitionVariant =
  | "room" // doors close, doors open
  | "iris" // aperture opens from the point you touched
  | "dolly" // the camera keeps moving forward into light
  | "blueprint" // the object slides away and becomes a drawing
  | "texture" // the drawing thickens into matter
  | "photo" // the matter becomes the ground of a photograph
  | "prototype" // an old photograph resolves into a wireframe
  | "fade"; // reduced motion

const seg = (path: string) => path.split("?")[0].split("/")[1] ?? "";

const pairs: Record<string, TransitionVariant> = {
  "objects>atelier": "blueprint",
  "atelier>objects": "blueprint",
  "atelier>materials": "texture",
  "materials>atelier": "texture",
  "materials>journal": "photo",
  "journal>materials": "photo",
  "archive>future": "prototype",
  "future>archive": "prototype",
  ">world": "dolly",
};

export function resolveVariant(from: string, to: string, hasOrigin: boolean): TransitionVariant {
  const key = `${seg(from)}>${seg(to)}`;
  if (pairs[key]) return pairs[key];
  if (hasOrigin || seg(from) === "world") return "iris";
  return "room";
}
