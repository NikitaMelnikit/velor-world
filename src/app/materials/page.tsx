import type { Metadata } from "next";
import { MaterialLab } from "@/features/materials/MaterialLab";

export const metadata: Metadata = {
  title: "Material Lab",
  description: "Steel, glass, stone, fabric, wood, composite — six specimens that react to your touch.",
};

export default function MaterialsPage() {
  return <MaterialLab />;
}
