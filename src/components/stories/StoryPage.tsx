"use client";

import { notFound } from "next/navigation";
import { StoryGallery } from "@/components/stories/StoryGallery";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getStory } from "@/content/stories";
import { useLocale } from "@/providers/LocaleProvider";

export function StoryPage({ slug }: { slug: string }) {
  const { locale } = useLocale(); const story = getStory(slug); if (!story) notFound(); const content = story.content[locale];
  return <article className="story-page"><header className="core-hero"><p>{content.eyebrow}</p><h1 className="core-title">{content.title}</h1><p className="core-intro">{content.intro}</p></header><div className="story-page__body"><time dateTime={story.publishedAt}>04 / 07 / 2024</time>{content.sections.map((section, index) => <section key={section.title}><span>0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p></div></section>)}<p className="story-page__closing">{content.closing}</p><StoryGallery /><EditorialButton href="/success-stories" label={locale === "el" ? "Όλες οι ιστορίες" : "All stories"} tone="dark" /></div></article>;
}
