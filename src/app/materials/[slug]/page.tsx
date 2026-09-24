import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMaterial, materials } from "@/content/materials";
import { MaterialScene } from "@/features/materials/MaterialScene";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return materials.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const m = getMaterial(slug);
  if (!m) return {};
  return { title: `${m.name} — Material Lab`, description: `${m.spec}. ${m.source.text}` };
}

export default async function MaterialPage({ params }: Params) {
  const { slug } = await params;
  if (!getMaterial(slug)) notFound();
  return <MaterialScene slug={slug} />;
}
