import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/content/journal";
import { ArticleView } from "@/features/journal/ArticleView";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return { title: `${a.title} — Journal`, description: a.dek, authors: [{ name: a.author }] };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  if (!getArticle(slug)) notFound();
  return <ArticleView slug={slug} />;
}
