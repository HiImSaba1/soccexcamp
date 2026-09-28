"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { useLocale } from "@/providers/LocaleProvider";

const specialists = [
  { name: "Tasos Maragozidis", image: "/media/wordpress/195-maragozidis_tasos.jpg", role: { en: "FIFA agent · CEO of SoccerX Camp", el: "FIFA agent · CEO του SoccerX Camp" } },
  { name: "Nickolay Guido", image: "/media/wordpress/1653-guido_nikolay.jpg", role: { en: "FIFA agent · CEO of SoccerX Camp", el: "FIFA agent · CEO του SoccerX Camp" } },
  { name: "Dimitris Petkakis", image: "/media/wordpress/197-dimitris_petkakis.jpg", role: { en: "Intermediary scouting agent · Soccer and More", el: "Intermediary scouting agent · Soccer and More" } },
  { name: "Dora Ioakeimidou", image: "/media/wordpress/198-dora_ioakeimidou.jpg", role: { en: "HR manager · Social media director", el: "HR manager · Social media director" } },
] as const;

export function SpecialistGrid() {
  const { locale } = useLocale();
  return <section className="specialists" aria-labelledby="specialists-title"><header><p>04 / {locale === "el" ? "Η ομάδα" : "The team"}</p><h2 id="specialists-title">{locale === "el" ? "Οι άνθρωποι πίσω από το SoccerX Camp." : "The people behind SoccerX Camp."}</h2></header><div className="specialists__grid">{specialists.map(person => <article key={person.name}><ParallaxImage src={person.image} alt={person.name} sizes="(max-width: 520px) 92vw, (max-width: 800px) 46vw, 24vw" speed={0} imageClassName="specialists__portrait" /><p>{person.role[locale]}</p><h3>{person.name}</h3></article>)}</div></section>;
}
