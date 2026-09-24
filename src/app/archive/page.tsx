import type { Metadata } from "next";
import { ArchiveExperience } from "@/features/archive/ArchiveExperience";

export const metadata: Metadata = {
  title: "Archive",
  description: "2022–2026: concepts, prototypes, sketches, photographs, rejected ideas — and the ideas we didn't build.",
};

export default function ArchivePage() {
  return <ArchiveExperience />;
}
