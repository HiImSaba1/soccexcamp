"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { useLocale } from "@/providers/LocaleProvider";

const profiles = [
  { name: "Stefan Schwab", image: "/media/wordpress/1546-stefan_shwab_paok_maragozidis_soccerxcamp.png", text: { en: "With midfielder Stefan Schwab following his signing at PAOK in Thessaloniki.", el: "Με τον μέσο Stefan Schwab μετά την υπογραφή του στον ΠΑΟΚ στη Θεσσαλονίκη." } },
  { name: "Aaron Manu", image: "/media/wordpress/242-soccer_x_camp_signing.jpg", text: { en: "The centre-back signed for Rot-Weiss Essen in Germany.", el: "Ο κεντρικός αμυντικός υπέγραψε στη Rot-Weiss Essen στη Γερμανία." } },
  { name: "Sascha Risch", image: "/media/wordpress/244-soccer_x_camp_signing_2.jpg", text: { en: "The versatile left-sided player signed for SSV Ulm 1846 in Germany.", el: "Ο πολυδιάστατος αριστεροπόδαρος παίκτης υπέγραψε στην SSV Ulm 1846 στη Γερμανία." } },
  { name: "Nikos Zografakis", image: "/media/wordpress/245-soccer_x_camp_signing_3.jpg", text: { en: "The winger signed for Hessen Kassel in Germany through summer 2025.", el: "Ο εξτρέμ Νίκος Ζωγραφάκης υπέγραψε στη Hessen Kassel στη Γερμανία έως το καλοκαίρι του 2025." } },
  { name: "Rilind Kabashi", image: "/media/wordpress/239-soccer_x_camp_signing_6.jpg", text: { en: "The central midfielder signed for FC Kaiserslautern in Germany.", el: "Ο κεντρικός μέσος Rilind Kabashi υπέγραψε στην FC Kaiserslautern στη Γερμανία." } },
  { name: "Michalis Zannakis", image: "/media/wordpress/1540-zannakis_hoffenheim_maragozidis.jpg", text: { en: "A trial opportunity with TSG Hoffenheim after participating in SoccerX Camp in Thessaloniki.", el: "Ευκαιρία για trial στην TSG Hoffenheim μετά τη συμμετοχή του στο SoccerX Camp Θεσσαλονίκης." } },
  { name: "Tobias Kraulich", image: "/media/wordpress/241-soccer_x_camp_signing_8.jpg", text: { en: "The centre-back signed for Dynamo Dresden in Germany.", el: "Ο κεντρικός αμυντικός Tobias Kraulich υπέγραψε στη Dynamo Dresden στη Γερμανία." } },
  { name: "Minos Gouras", image: "/media/wordpress/246-soccer_x_camp_signing_4.jpg", text: { en: "The winger joined SV Waldhof Mannheim in Germany.", el: "Ο εξτρέμ Minos Gouras παρουσιάστηκε στην SV Waldhof Mannheim στη Γερμανία." } },
  { name: "Nikolas Kristof", image: "/media/wordpress/248-soccer_x_camp_signing_5.jpg", text: { en: "The goalkeeper signed for SV Elversberg in Germany.", el: "Ο τερματοφύλακας Nikolas Kristof υπέγραψε στην SV Elversberg στη Γερμανία." } },
  { name: "Panagiotis Deliopoulos", image: "/media/wordpress/123-paok_deliopoulos_petkakis.jpg", text: { en: "Signed with PAOK following his participation at SoccerX Camp.", el: "Υπέγραψε στον ΠΑΟΚ μετά τη συμμετοχή του στο SoccerX Camp." } },
  { name: "Nikolaos Aristadis", image: "/media/wordpress/1544-aristadis_soccerx_camp_petkakis_maragozidis.jpg", text: { en: "Earned a trial opportunity with Red Bull Salzburg after SoccerX Camp.", el: "Κέρδισε την ευκαιρία για trial στη Red Bull Salzburg μετά το SoccerX Camp." } },
  { name: "Dimitrios Giannoulis", image: "/media/wordpress/1547-giannouis_maragozidis.png", text: { en: "A Greece international whose development path included a Hoffenheim trial at the age of 14.", el: "Διεθνής με την Ελλάδα, με trial στη Hoffenheim σε ηλικία 14 ετών ως μέρος της αναπτυξιακής του πορείας." } },
] as const;

export function SuccessProfiles() {
  const { locale } = useLocale();
  return <section className="success-profiles" aria-labelledby="success-profiles-title"><header><p>03 / {locale === "el" ? "Ιστορίες" : "Stories"}</p><h2 id="success-profiles-title">{locale === "el" ? "Διαδρομές προς το επόμενο επίπεδο." : "Pathways to the next level."}</h2></header><div className="success-profiles__grid">{profiles.map((profile, index) => <article key={profile.name}><ParallaxImage src={profile.image} alt={profile.name} sizes="(max-width: 760px) 100vw, 33vw" speed={index % 2 ? 8 : 5} /><span>{String(index + 1).padStart(2, "0")}</span><h3>{profile.name}</h3><p>{profile.text[locale]}</p></article>)}</div></section>;
}
