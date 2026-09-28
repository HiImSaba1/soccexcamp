"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { useLocale } from "@/providers/LocaleProvider";

export function HomeAboutIntro() {
  const { dictionary: d, locale } = useLocale();
  return <section className="home-about">
    <p>{d.about.eyebrow}</p>
    <SplitReveal className="about-title">{d.about.title}</SplitReveal>
    <ParallaxImage className="about-media" src="/media/soccerxcamp/june-2024-team.jpg" alt={locale === "el" ? "Η ομάδα του SoccerX Camp δίπλα στον αγωνιστικό χώρο" : "The SoccerX Camp team beside the football pitch"} sizes="(max-width: 700px) 100vw, 42vw" />
    <div className="about-copy"><p>{d.about.body}</p><EditorialButton href="/about" label={d.about.cta} tone="dark" /></div>
  </section>;
}
