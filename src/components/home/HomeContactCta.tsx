"use client";

import { EditorialButton } from "@/components/ui/EditorialButton";
import { useLocale } from "@/providers/LocaleProvider";

export function HomeContactCta() {
  const { locale } = useLocale(); const greek = locale === "el";
  return <section className="home-contact-cta" aria-labelledby="home-contact-title"><p className="eyebrow">04 / {greek ? "Επικοινωνία" : "Contact"}</p><div className="home-contact-cta__heading"><h2 id="home-contact-title">{greek ? "Η επόμενη ευκαιρία ξεκινά με μια ουσιαστική συζήτηση." : "Your next opportunity starts with a meaningful conversation."}</h2></div><p>{greek ? "Μίλησε με την ομάδα μας για τα επόμενα trials, τη διαδικασία συμμετοχής και την προετοιμασία σου." : "Speak with our team about upcoming trials, the participation process and how to prepare."}</p><EditorialButton href="/contact" label={greek ? "Επικοινώνησε μαζί μας" : "Contact SoccerX Camp"} /></section>;
}
