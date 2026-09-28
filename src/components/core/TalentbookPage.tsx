"use client";

import { Download } from "lucide-react";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { useLocale } from "@/providers/LocaleProvider";

export function TalentbookPage() {
  const { locale } = useLocale();
  const el = locale === "el";
  return <article className="core-page talentbook-page">
    <header className="core-hero"><ParallaxImage className="core-hero__media" src="/media/wordpress/71-kids_playing_2-scaled.jpg" alt={el ? "Νεαροί ποδοσφαιριστές προπονούνται στο SoccerX Camp" : "Young footballers training at SoccerX Camp"} sizes="100vw" speed={5} loading="eager" fetchPriority="high" /><div className="core-hero__veil" aria-hidden="true" /><p>{el ? "Αρχείο παικτών" : "Player archive"}</p><SplitReveal className="core-title">Talentbook</SplitReveal><p className="core-intro">{el ? "Ιστορικές εκδόσεις του SoccerX Camp, με προστασία των προσωπικών δεδομένων των παικτών." : "Historical SoccerX Camp publications with player privacy built into the archive."}</p></header>
    <section className="talentbook-feature">
      <ParallaxImage src="/media/soccerxcamp/talentbook-2023-cover.png" alt={el ? "Εξώφυλλο του Soccer and More U23 Talentbook" : "Cover of the Soccer and More U23 Talentbook"} sizes="(max-width: 760px) 88vw, 34vw" speed={6} />
      <div><p>2023 / {el ? "Ιστορική έκδοση" : "Historical edition"}</p><h2>U23 Talentbook</h2><p>{el ? "Η ιστορική έκδοση είναι διαθέσιμη ως αρχείο PDF για λήψη. Περιλαμβάνει αναλυτικά προφίλ παικτών και προορίζεται για ενημερωτική χρήση." : "The historical edition is available as a downloadable PDF. It contains detailed player profiles and is provided for informational use."}</p><p>{el ? "Με τη λήψη, το αρχείο αποθηκεύεται στη συσκευή σας αντί να ανοίγει μέσα στη σελίδα." : "The download saves the publication to your device instead of opening it inside the page."}</p><a className="talentbook-download" href="/media/wordpress/1257-Talentebuch-final.pdf" download="SoccerXCamp-U23-Talentbook-2023.pdf"><span className="action-button__fill" aria-hidden="true" /><span className="action-button__label"><span>{el ? "Λήψη Talentbook PDF" : "Download Talentbook PDF"}</span><span aria-hidden="true">{el ? "Λήψη Talentbook PDF" : "Download Talentbook PDF"}</span></span><span className="action-button__arrow" aria-hidden="true"><Download /></span></a></div>
    </section>
  </article>;
}
