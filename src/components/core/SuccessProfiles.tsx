"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { useLocale } from "@/providers/LocaleProvider";

const profiles = [
  { name: "Stefan Schwab", image: "/media/wordpress/1546-stefan_shwab_paok_maragozidis_soccerxcamp.png", text: { en: "With midfielder Stefan Schwab following his signing at PAOK in Thessaloniki.", el: "Με τον μέσο Stefan Schwab μετά την υπογραφή του στον ΠΑΟΚ στη Θεσσαλονίκη." } },
  { name: "Michalis Zannakis", image: "/media/wordpress/1540-zannakis_hoffenheim_maragozidis.jpg", text: { en: "A trial opportunity with TSG Hoffenheim after participating in SoccerX Camp in Thessaloniki.", el: "Ευκαιρία για trial στην TSG Hoffenheim μετά τη συμμετοχή του στο SoccerX Camp Θεσσαλονίκης." } },
  { name: "Panagiotis Deliopoulos", image: "/media/wordpress/123-paok_deliopoulos_petkakis.jpg", text: { en: "Signed with PAOK following his participation at SoccerX Camp.", el: "Υπέγραψε στον ΠΑΟΚ μετά τη συμμετοχή του στο SoccerX Camp." } },
  { name: "Nikolaos Aristadis", image: "/media/wordpress/1544-aristadis_soccerx_camp_petkakis_maragozidis.jpg", text: { en: "Earned a trial opportunity with Red Bull Salzburg after SoccerX Camp.", el: "Κέρδισε την ευκαιρία για trial στη Red Bull Salzburg μετά το SoccerX Camp." } },
  { name: "Dimitrios Giannoulis", image: "/media/wordpress/1547-giannouis_maragozidis.png", text: { en: "A Greece international whose development path included a Hoffenheim trial at the age of 14.", el: "Διεθνής με την Ελλάδα, με trial στη Hoffenheim σε ηλικία 14 ετών ως μέρος της αναπτυξιακής του πορείας." } },
] as const;

export function SuccessProfiles() {
  const { locale } = useLocale();
  return <section className="success-profiles" aria-labelledby="success-profiles-title"><header><p>03 / {locale === "el" ? "Ιστορίες" : "Stories"}</p><h2 id="success-profiles-title">{locale === "el" ? "Διαδρομές προς το επόμενο επίπεδο." : "Pathways to the next level."}</h2></header><div className="success-profiles__grid">{profiles.map((profile, index) => <article key={profile.name}><ParallaxImage src={profile.image} alt={profile.name} sizes="(max-width: 760px) 100vw, 33vw" speed={index % 2 ? 8 : 5} /><span>0{index + 1}</span><h3>{profile.name}</h3><p>{profile.text[locale]}</p></article>)}</div></section>;
}
