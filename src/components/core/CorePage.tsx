"use client";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getCorePage, type CorePageKey } from "@/content/core-pages";
import { useLocale } from "@/providers/LocaleProvider";

const heroMedia: Record<CorePageKey, { src: string; alt: { en: string; el: string } }> = {
  about: { src: "/media/wordpress/2005-tasos_petkakis_scouters_soccerxcamp_fifa.jpg", alt: { en: "SoccerX Camp team and international football professionals", el: "Η ομάδα του SoccerX Camp με ανθρώπους του διεθνούς ποδοσφαίρου" } },
  success: { src: "/media/wordpress/1547-giannouis_maragozidis.png", alt: { en: "SoccerX Camp player pathway and professional football network", el: "Η πορεία παικτών και το επαγγελματικό δίκτυο του SoccerX Camp" } },
  event: { src: "/media/wordpress/2678-soccerxcamp_april_trails_germany_main.jpg", alt: { en: "SoccerX Trials Germany event", el: "Διοργάνωση SoccerX Trials στη Γερμανία" } },
  apply: { src: "/media/soccerxcamp/june-2024-match-05.jpg", alt: { en: "Footballers competing at SoccerX Camp", el: "Ποδοσφαιριστές αγωνίζονται στο SoccerX Camp" } },
  talentbook: { src: "/media/wordpress/1513-soccerxcamp_talentbook.png", alt: { en: "SoccerX Camp Talentbook publication", el: "Έκδοση Talentbook του SoccerX Camp" } },
  contact: { src: "/media/wordpress/326-dora_soccerxcamp.jpg", alt: { en: "SoccerX Camp team representative", el: "Εκπρόσωπος της ομάδας SoccerX Camp" } },
  privacy: { src: "/media/wordpress/499-soccerxcamp.jpg", alt: { en: "SoccerX Camp players and organizers", el: "Παίκτες και διοργανωτές του SoccerX Camp" } },
};

export function CorePage({ page }: { page: CorePageKey }) {
  const { locale } = useLocale();
  const content = getCorePage(locale, page);
  const media = heroMedia[page];

  return <article className="core-page">
    <header className="core-hero">
      <ParallaxImage className="core-hero__media" src={media.src} alt={media.alt[locale]} sizes="100vw" speed={5} loading="eager" fetchPriority="high" />
      <div className="core-hero__veil" aria-hidden="true" />
      <p>{content.eyebrow}</p>
      <SplitReveal className="core-title">{content.title}</SplitReveal>
      <p className="core-intro">{content.intro}</p>
    </header>
    <div className="core-sections">{content.sections.map((section, index) => <section key={section.title}><span>0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p>{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</div></section>)}</div>
    {content.cta && <div className="core-cta"><EditorialButton href={content.cta.href} label={content.cta.label} tone="dark" /></div>}
  </article>;
}
