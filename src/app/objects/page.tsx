import type { Metadata } from "next";
import { ProductWorld } from "@/features/objects/ProductWorld";

export const metadata: Metadata = {
  title: "Objects",
  description: "The VELOR collection — four objects, four rooms. Turn them, open them, compare their materials.",
};

export default function ObjectsPage() {
  return <ProductWorld />;
}
