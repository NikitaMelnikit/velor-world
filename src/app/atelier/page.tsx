import type { Metadata } from "next";
import { AtelierExperience } from "@/features/atelier/AtelierExperience";

export const metadata: Metadata = {
  title: "Atelier",
  description: "Research, sketch, prototype, material, engineering, final object — the VELOR atelier.",
};

export default function AtelierPage() {
  return <AtelierExperience />;
}
