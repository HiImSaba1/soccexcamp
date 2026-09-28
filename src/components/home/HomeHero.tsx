"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { gsap } from "@/lib/motion/gsap";
import { useLocale } from "@/providers/LocaleProvider";

const content = {
  en: [
    { href: "/success-stories", button: "Explore the experience", eyebrow: "International football trials", title: "Your talent.\nYour next move.", description: "A focused international environment for ambitious footballers.", image: "/media/wordpress/499-soccerxcamp.jpg", alt: "SoccerX Camp players and organizers on the football pitch" },
    { href: "/about", button: "Meet SoccerX Camp", eyebrow: "Preparation · Exposure · Opportunity", title: "Built for the\nnext level.", description: "Serious coaching, competitive play and genuine pathways into professional football.", image: "/media/soccerxcamp/june-2024-match-03.jpg", alt: "A competitive football match at SoccerX Camp" },
    { href: "/apply", button: "Application information", eyebrow: "Your journey starts here", title: "Ready for\nyour trial?", description: "Discover the participation process and prepare for your next international opportunity.", image: "/media/soccerxcamp/june-2024-match-05.jpg", alt: "Players in action on the pitch during SoccerX Camp" },
  ],
  el: [
    { href: "/success-stories", button: "Δες την εμπειρία", eyebrow: "Διεθνή ποδοσφαιρικά trials", title: "Το ταλέντο σου.\nΗ επόμενη κίνηση.", description: "Ένα απαιτητικό διεθνές περιβάλλον για ποδοσφαιριστές με φιλοδοξίες.", image: "/media/wordpress/499-soccerxcamp.jpg", alt: "Παίκτες και διοργανωτές του SoccerX Camp στο γήπεδο" },
    { href: "/about", button: "Γνώρισε το SoccerX Camp", eyebrow: "Προετοιμασία · Προβολή · Ευκαιρία", title: "Χτισμένο για\nτο επόμενο επίπεδο.", description: "Σοβαρή προπόνηση, ανταγωνιστικό παιχνίδι και πραγματικές διαδρομές προς το επαγγελματικό ποδόσφαιρο.", image: "/media/soccerxcamp/june-2024-match-03.jpg", alt: "Ανταγωνιστικός αγώνας ποδοσφαίρου στο SoccerX Camp" },
    { href: "/apply", button: "Πληροφορίες συμμετοχής", eyebrow: "Η διαδρομή σου ξεκινά εδώ", title: "Έτοιμος για\nτο trial σου;", description: "Δες τη διαδικασία συμμετοχής και προετοιμάσου για την επόμενη διεθνή ευκαιρία.", image: "/media/soccerxcamp/june-2024-match-05.jpg", alt: "Παίκτες σε αγωνιστική δράση στο SoccerX Camp" },
  ],
} as const;

export function HomeHero() {
  const { locale } = useLocale();
  const slides = content[locale];
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);
  const drag = useRef({ pointerId: -1, startX: 0, startY: 0 });
  const stop = useCallback(() => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; }, []);
  const move = useCallback((direction: number) => setActive(value => (value + direction + slides.length) % slides.length), [slides.length]);
  const start = useCallback(() => {
    stop();
    if (root.current?.matches(":hover") || root.current?.contains(document.activeElement)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return;
    timer.current = window.setInterval(() => move(1), 7500);
  }, [move, stop]);

  useEffect(() => {
    start(); const visibility = () => document.hidden ? stop() : start();
    document.addEventListener("visibilitychange", visibility);
    return () => { stop(); document.removeEventListener("visibilitychange", visibility); };
  }, [start, stop]);

  useGSAP(() => {
    const current = root.current?.querySelector<HTMLElement>(`[data-hero-slide="${active}"]`);
    const copy = root.current?.querySelector<HTMLElement>("[data-hero-copy]");
    if (!current || !copy || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = copy.querySelectorAll("[data-hero-reveal]");
    if (!targets.length) return;
    const timeline = gsap.timeline().fromTo(current, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, clipPath: "inset(0)", duration: 1.05, ease: "power4.inOut" }).fromTo(targets, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .72, stagger: .1, ease: "power3.out" }, "-=.56");
    return () => timeline.kill();
  }, { scope: root, dependencies: [active, locale], revertOnUpdate: true });

  const slide = slides[active];
  const select = (index: number) => { setActive(index); start(); };
  const beginDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as Element).closest("a,button")) return;
    stop(); drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* optional */ }
  };
  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    const x = event.clientX - drag.current.startX; const y = event.clientY - drag.current.startY; drag.current.pointerId = -1;
    if (Math.abs(x) >= 55 && Math.abs(x) > Math.abs(y)) move(x < 0 ? 1 : -1); start();
  };

  return <section ref={root} className="home-hero home-hero-slider" aria-roledescription="carousel" aria-label={locale === "el" ? "Κύριες πληροφορίες SoccerX Camp" : "SoccerX Camp highlights"} tabIndex={0} onKeyDown={event => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} onMouseEnter={stop} onMouseLeave={start} onFocusCapture={stop} onBlurCapture={start} onPointerDown={beginDrag} onPointerUp={endDrag} onPointerCancel={start}>
    <div className="home-hero__slides" aria-live="off">{slides.map((item, index) => <div key={item.href} data-hero-slide={index} data-active={index === active ? "true" : undefined} className="home-hero__slide" aria-hidden={index !== active}><ParallaxImage src={item.image} alt={item.alt} className="home-hero__image" sizes="100vw" loading="eager" fetchPriority={index === 0 ? "high" : "auto"} speed={6} /></div>)}<span className="home-hero__overlay" aria-hidden="true" /></div>
    <div key={`${locale}-${slide.href}`} className="home-hero__content" data-hero-copy><p className="home-hero__eyebrow" data-hero-reveal>{slide.eyebrow}</p><h1 id="home-title" className="home-hero__title" data-hero-reveal>{slide.title.split("\n").map(line => <span key={line}>{line}</span>)}</h1><p className="home-hero__intro" data-hero-reveal>{slide.description}</p><div data-hero-reveal><EditorialButton href={slide.href} label={slide.button} /></div></div>
    <button className="home-hero__arrow home-hero__arrow--previous" type="button" onClick={() => { move(-1); start(); }} aria-label={locale === "el" ? "Προηγούμενη διαφάνεια" : "Previous slide"}><ArrowLeft /></button>
    <button className="home-hero__arrow home-hero__arrow--next" type="button" onClick={() => { move(1); start(); }} aria-label={locale === "el" ? "Επόμενη διαφάνεια" : "Next slide"}><ArrowRight /></button>
    <div className="home-hero__pagination" aria-label={locale === "el" ? "Επιλογή διαφάνειας" : "Choose slide"}>{slides.map((item, index) => <button key={item.href} type="button" onClick={() => select(index)} aria-label={`${locale === "el" ? "Διαφάνεια" : "Slide"} ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}</div>
  </section>;
}
