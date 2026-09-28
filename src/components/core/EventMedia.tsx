"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { useLocale } from "@/providers/LocaleProvider";

export function EventMedia() {
  const { locale } = useLocale();
  return <section className="event-media" aria-labelledby="event-media-title"><header><p>04 / {locale === "el" ? "Αρχείο διοργάνωσης" : "Event archive"}</p><h2 id="event-media-title">{locale === "el" ? "Η εμπειρία της Γερμανίας." : "The Germany experience."}</h2></header><div><ParallaxImage src="/media/wordpress/2678-soccerxcamp_april_trails_germany_main.jpg" alt={locale === "el" ? "Καμπάνια SoccerX Trials στη Γερμανία" : "SoccerX Trials Germany campaign"} sizes="(max-width: 760px) 100vw, 62vw" speed={7} /><ParallaxImage src="/media/wordpress/2416-fun4you.jpg" alt={locale === "el" ? "Αθλητικές εγκαταστάσεις Fun4You στο Wiesloch" : "Fun4You sports facilities in Wiesloch"} sizes="(max-width: 760px) 100vw, 38vw" speed={5} /></div></section>;
}
