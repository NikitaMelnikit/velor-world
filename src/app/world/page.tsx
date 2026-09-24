import type { Metadata } from "next";
import { WorldMap } from "@/features/world/WorldMap";

export const metadata: Metadata = {
  title: "World",
  description: "The map of the VELOR world — seven rooms, one territory.",
};

export default function WorldPage() {
  return <WorldMap />;
}
