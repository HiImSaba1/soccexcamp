"use client";

import { EditorialButton } from "@/components/ui/EditorialButton";
import { stories } from "@/content/stories";
import { useLocale } from "@/providers/LocaleProvider";

export function StoryArchive() {
  const { locale } = useLocale();
  return <section className="story-archive" aria-labelledby="story-archive-title"><p>03 / {locale === "el" ? "Από το αρχείο" : "From the archive"}</p><h2 id="story-archive-title">{locale === "el" ? "Ιστορίες από το γήπεδο." : "Stories from the pitch."}</h2><div>{stories.map(story => { const item = story.content[locale]; return <article key={story.slug}><time dateTime={story.publishedAt}>04 / 07 / 2024</time><h3>{item.title}</h3><p>{item.intro}</p><EditorialButton href={`/stories/${story.slug}`} label={locale === "el" ? "Διάβασε την ιστορία" : "Read the story"} tone="dark" /></article>; })}</div></section>;
}
