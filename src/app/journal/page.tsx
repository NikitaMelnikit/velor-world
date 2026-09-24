import type { Metadata } from "next";
import { JournalIndex } from "@/features/journal/JournalIndex";

export const metadata: Metadata = {
  title: "Journal",
  description: "VELOR Journal — interviews, essays, behind the scenes, architecture, culture, design and visual stories.",
};

export default function JournalPage() {
  return <JournalIndex />;
}
