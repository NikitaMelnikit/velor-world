import type { Metadata } from "next";
import { CollectionSpace } from "@/features/collection/CollectionSpace";

export const metadata: Metadata = {
  title: "Your Collection",
  description: "Your private archive inside the VELOR world.",
  robots: { index: false },
};

export default function CollectionPage() {
  return <CollectionSpace />;
}
