"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { gsap, SplitText } from "@/lib/motion/gsap";
import { useLocale } from "@/providers/LocaleProvider";

const testimonials = {
  en: [
    { quote: "I would like to commend the SoccerX Camp organization for its exceptional facilities and well-structured programme. The knowledgeable coaches provided a highly valuable experience for players and for me as a scout observing them in different scenarios.", name: "Robert Flanagan", role: "Scout at Norwich City" },
    { quote: "The level of the players across the different age categories was very good, and some were outstanding. We could also see very young players with strong potential to develop.", name: "Joel Damahou", role: "Technical Director, Aris Limassol" },
    { quote: "The organisation was highly professional at every level, from the quality of the football to the coaches. Bringing players from across Europe together over three days created a tremendous opportunity.", name: "Gregory Knoof", role: "Scout and coach, FC Astoria Walldorf" },
    { quote: "The diversity and talent at SoccerX Camp are unmatched. Its organisation makes it possible to focus on both individual and team skills, giving future professional players a unique opportunity to prove their worth.", name: "Ivo Rogalo", role: "Scout, Balkans" },
  ],
  el: [
    { quote: "Θέλω να συγχαρώ τη διοργάνωση του SoccerX Camp για τις εξαιρετικές εγκαταστάσεις και το άρτια οργανωμένο πρόγραμμα. Οι έμπειροι προπονητές πρόσφεραν μια πολύτιμη εμπειρία στους παίκτες και σε εμένα ως scout, ώστε να τους παρακολουθήσω σε διαφορετικές συνθήκες.", name: "Robert Flanagan", role: "Scout στη Norwich City" },
    { quote: "Το επίπεδο των παικτών στις διαφορετικές ηλικιακές κατηγορίες ήταν πολύ καλό, ενώ ορισμένοι ξεχώρισαν πραγματικά. Είδαμε επίσης πολύ νεαρούς παίκτες με σημαντικές δυνατότητες εξέλιξης.", name: "Joel Damahou", role: "Τεχνικός Διευθυντής, Aris Limassol" },
    { quote: "Η διοργάνωση ήταν επαγγελματική σε κάθε επίπεδο, από την ποιότητα του ποδοσφαίρου μέχρι τους προπονητές. Η συνάντηση παικτών από όλη την Ευρώπη για τρεις ημέρες δημιούργησε μια σπουδαία ευκαιρία.", name: "Gregory Knoof", role: "Scout και προπονητής, FC Astoria Walldorf" },
    { quote: "Η ποικιλομορφία και το ταλέντο στο SoccerX Camp είναι ασύγκριτα. Η οργάνωση επιτρέπει την αξιολόγηση τόσο των ατομικών όσο και των ομαδικών δεξιοτήτων, δίνοντας στους αυριανούς επαγγελματίες μια μοναδική ευκαιρία να αποδείξουν την αξία τους.", name: "Ivo Rogalo", role: "Scout, Βαλκάνια" },
  ],
} as const;

export function HomeTestimonials() {
  const { locale } = useLocale();
  const items = testimonials[locale];
  const [selected, setSelected] = useState(0);
  const root = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => { if (timer.current) clearInterval(timer.current); timer.current = null; }, []);
  const start = useCallback(() => { stop(); if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer.current = setInterval(() => setSelected(value => (value + 1) % items.length), 7500); }, [items.length, stop]);
  const move = useCallback((direction: number) => { setSelected(value => (value + direction + items.length) % items.length); start(); }, [items.length, start]);

  useEffect(() => { start(); const visibility = () => document.hidden ? stop() : start(); document.addEventListener("visibilitychange", visibility); return () => { stop(); document.removeEventListener("visibilitychange", visibility); }; }, [start, stop]);
  useGSAP(() => {
    const quote = root.current?.querySelector<HTMLElement>("blockquote");
    const details = root.current?.querySelectorAll<HTMLElement>("[data-testimonial-reveal]");
    if (!quote || !details?.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = SplitText.create(quote, { type: "lines", mask: "lines", aria: "auto" });
    const timeline = gsap.timeline().fromTo(split.lines, { yPercent: 115 }, { yPercent: 0, duration: .75, stagger: .07, ease: "power4.out" }).fromTo(details, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, stagger: .06 }, "-=.35");
    return () => { timeline.kill(); split.revert(); };
  }, { scope: root, dependencies: [selected, locale], revertOnUpdate: true });

  const item = items[selected];
  const greek = locale === "el";
  return <section ref={root} className="home-testimonials" aria-labelledby="home-testimonials-title" onMouseEnter={stop} onMouseLeave={start} onFocusCapture={stop} onBlurCapture={start}>
    <header><p className="eyebrow">03 / {greek ? "Εμπειρίες scouts" : "Scout perspectives"}</p><h2 id="home-testimonials-title">{greek ? "Λόγια ανθρώπων που είδαν το SoccerX Camp από κοντά." : "Words from people who experienced SoccerX Camp first-hand."}</h2></header>
    <article key={`${locale}-${item.name}`} aria-live="polite"><Quote aria-hidden="true" /><div><p className="home-testimonials__count" data-testimonial-reveal>0{selected + 1} / 0{items.length}</p><blockquote>“{item.quote}”</blockquote><p className="home-testimonials__name" data-testimonial-reveal>{item.name}</p><p className="home-testimonials__role" data-testimonial-reveal>{item.role}</p></div></article>
    <footer><div className="home-testimonials__dots" aria-label={greek ? "Επιλογή μαρτυρίας" : "Choose testimonial"}>{items.map((testimonial, index) => <button key={testimonial.name} type="button" aria-label={`${greek ? "Μαρτυρία" : "Testimonial"} ${index + 1}`} aria-current={selected === index ? "true" : undefined} onClick={() => { setSelected(index); start(); }} />)}</div><div className="home-testimonials__arrows"><button type="button" aria-label={greek ? "Προηγούμενη μαρτυρία" : "Previous testimonial"} onClick={() => move(-1)}><ArrowLeft /></button><button type="button" aria-label={greek ? "Επόμενη μαρτυρία" : "Next testimonial"} onClick={() => move(1)}><ArrowRight /></button></div></footer>
  </section>;
}
