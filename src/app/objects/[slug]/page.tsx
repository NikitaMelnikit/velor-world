import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/content/products";
import { ObjectStory } from "@/features/objects/ObjectStory";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: `${p.name} — ${p.type}`, description: `${p.tagline} ${p.summary}` };
}

export default async function ObjectStoryPage({ params }: Params) {
  const { slug } = await params;
  if (!getProduct(slug)) notFound();
  return <ObjectStory slug={slug} />;
}
