import type { Metadata } from "next";
import { OriginJourney } from "@/features/origin/OriginJourney";

export const metadata: Metadata = {
  title: "Origin",
  description: "The question, the experiment, the failure, the discovery, the object, the brand.",
};

export default function OriginPage() {
  return <OriginJourney />;
}
