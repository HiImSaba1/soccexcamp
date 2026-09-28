"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { useLocale } from "@/providers/LocaleProvider";

const photos = [
  { src: "/media/soccerxcamp/june-2024-match-02.jpg", en: "A player driving forward under pressure", el: "Παίκτης προχωρά με την μπάλα υπό πίεση" },
  { src: "/media/soccerxcamp/june-2024-match-03.jpg", en: "Players competing during the June 2024 camp", el: "Παίκτες αγωνίζονται στο camp του Ιουνίου 2024" },
  { src: "/media/soccerxcamp/june-2024-match-04.jpg", en: "A close contest for possession", el: "Δυνατή μονομαχία για την κατοχή" },
  { src: "/media/soccerxcamp/june-2024-goalkeeper.jpg", en: "Goalkeeper action during a match", el: "Τερματοφύλακας σε αγωνιστική δράση" },
  { src: "/media/soccerxcamp/june-2024-match-05.jpg", en: "Match play at SoccerX Camp", el: "Αγωνιστική δράση στο SoccerX Camp" },
  { src: "/media/soccerxcamp/june-2024-team.jpg", en: "The SoccerX Camp team beside the pitch", el: "Η ομάδα του SoccerX Camp δίπλα στο γήπεδο" },
] as const;

export function StoryGallery() {
  const { locale } = useLocale();
  const [index, setIndex] = useState(-1);
  return <section className="story-gallery" aria-labelledby="story-gallery-title" data-no-global-reveal>
    <div className="story-gallery__heading"><span>04</span><h2 id="story-gallery-title">{locale === "el" ? "Από το γήπεδο" : "From the pitch"}</h2></div>
    <div className="story-gallery__grid">{photos.map((photo, photoIndex) => <button type="button" key={photo.src} onClick={() => setIndex(photoIndex)} aria-label={`${locale === "el" ? "Άνοιγμα φωτογραφίας" : "Open photo"} ${photoIndex + 1}: ${photo[locale]}`}><ParallaxImage src={photo.src} alt={photo[locale]} sizes="(max-width: 720px) 100vw, 50vw" speed={7} /></button>)}</div>
    <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index < 0 ? 0 : index} slides={photos.map(photo => ({ src: photo.src, alt: photo[locale] }))} controller={{ closeOnBackdropClick: true }} />
  </section>;
}
