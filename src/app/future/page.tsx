import type { Metadata } from "next";
import { FutureSpace } from "@/features/future/FutureSpace";

export const metadata: Metadata = {
  title: "Future",
  description: "Experimental objects, speculative materials, unfinished concepts. Not everything here is meant to exist.",
};

export default function FuturePage() {
  return <FutureSpace />;
}
