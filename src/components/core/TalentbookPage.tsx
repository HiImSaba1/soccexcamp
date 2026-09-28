"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { useLocale } from "@/providers/LocaleProvider";

export function TalentbookPage() {
  const { locale } = useLocale();
  const el = locale === "el";
  return <article className="core-page talentbook-page">
    <header className="core-hero"><p>{el ? "Αρχείο παικτών" : "Player archive"}</p><SplitReveal className="core-title">Talentbook</SplitReveal><p className="core-intro">{el ? "Ιστορικές εκδόσεις του SoccerX Camp, με προστασία των προσωπικών δεδομένων των παικτών." : "Historical SoccerX Camp publications with player privacy built into the archive."}</p></header>
    <section className="talentbook-feature">
      <ParallaxImage src="/media/soccerxcamp/talentbook-2023-cover.png" alt={el ? "Εξώφυλλο του Soccer and More U23 Talentbook" : "Cover of the Soccer and More U23 Talentbook"} sizes="(max-width: 760px) 88vw, 34vw" speed={6} />
      <div><p>2023 / {el ? "Ιστορική έκδοση" : "Historical edition"}</p><h2>U23 Talentbook</h2><p>{el ? "Το εξώφυλλο διατηρείται ως μέρος του αρχείου. Το αρχικό PDF δεν διατίθεται δημόσια, επειδή περιλαμβάνει ημερομηνίες γέννησης, στοιχεία επικοινωνίας και άλλα προσωπικά δεδομένα παικτών." : "The cover is retained as part of the historical archive. The original PDF is not publicly available because it includes player birth dates, contact details and other personal information."}</p><p>{el ? "Οι επόμενες εκδόσεις θα χρησιμοποιούν ελεγχόμενα, προσβάσιμα web profiles με σαφή συγκατάθεση." : "Future editions will use reviewed, accessible web profiles with explicit consent."}</p></div>
    </section>
  </article>;
}
