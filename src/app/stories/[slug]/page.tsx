import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryPage } from "@/components/stories/StoryPage";
import { getStory, stories } from "@/content/stories";

export function generateStaticParams() { return stories.map(story => ({ slug: story.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const story = getStory(slug); if (!story) return {}; const url = `/stories/${slug}`; const image = "/media/soccerxcamp/june-2024-team.jpg"; return { title: story.content.en.title, description: story.content.en.intro, alternates: { canonical: url }, openGraph: { title: story.content.en.title, description: story.content.en.intro, url, type: "article", publishedTime: story.publishedAt, images: [{ url: image, alt: "SoccerX Camp team beside the football pitch" }] }, twitter: { card: "summary_large_image", title: story.content.en.title, description: story.content.en.intro, images: [image] } }; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!getStory(slug)) notFound(); return <StoryPage slug={slug} />; }
