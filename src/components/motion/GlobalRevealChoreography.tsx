"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { gsap, SplitText } from "@/lib/motion/gsap";
import { usePageTransition } from "@/providers/PageTransitionProvider";

const excludedOwner = ".home-hero, .site-menu, .site-footer, .page-transition-curtain, [data-no-global-reveal]";
function eligible(element: Element): element is HTMLElement { return element instanceof HTMLElement && !element.closest(excludedOwner); }

export function GlobalRevealChoreography() {
  const pathname = usePathname(); const { isPageReady } = usePageTransition();
  useGSAP(() => {
    if (!isPageReady || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false; const splits: SplitText[] = []; const timelines: gsap.core.Timeline[] = []; const processed = new Set<Element>();
    const setup = () => {
      if (cancelled) return;
      const containers = Array.from(document.querySelectorAll<HTMLElement>("main header, main section"));
      containers.forEach(container => {
        if (container.closest(excludedOwner)) return;
        const headings = Array.from(container.querySelectorAll("h1, h2, h3")).filter(element => eligible(element) && !processed.has(element));
        const paragraphs = Array.from(container.querySelectorAll("p:not(.eyebrow)")).filter(element => eligible(element) && !processed.has(element));
        const items = Array.from(container.querySelectorAll(":scope > ol > li, :scope > ul > li")).filter(element => eligible(element) && !processed.has(element));
        [...headings, ...paragraphs, ...items].forEach(element => processed.add(element));
        if (!headings.length && !paragraphs.length && !items.length) return;
        const words = headings.flatMap(heading => { const split = SplitText.create(heading, { type: "words", mask: "words", aria: "auto" }); splits.push(split); return split.words; });
        const lines = paragraphs.flatMap(paragraph => { const split = SplitText.create(paragraph, { type: "lines", mask: "lines", autoSplit: true, aria: "auto" }); splits.push(split); return split.lines; });
        if (words.length) gsap.set(words, { yPercent: 112, autoAlpha: 0, rotate: .001, willChange: "transform" });
        if (lines.length) gsap.set(lines, { yPercent: 108, autoAlpha: 0, rotate: .001, willChange: "transform" });
        if (items.length) gsap.set(items, { y: 28, autoAlpha: 0, willChange: "transform" });
        const timeline = gsap.timeline({ scrollTrigger: { trigger: container, start: "top 86%", once: true } });
        if (words.length) timeline.to(words, { yPercent: 0, autoAlpha: 1, duration: .85, stagger: .035, ease: "power4.out", clearProps: "transform,opacity,visibility,willChange" });
        if (lines.length) timeline.to(lines, { yPercent: 0, autoAlpha: 1, duration: .78, stagger: .055, ease: "power3.out", clearProps: "transform,opacity,visibility,willChange" }, words.length ? "-=.42" : 0);
        if (items.length) timeline.to(items, { y: 0, autoAlpha: 1, duration: .68, stagger: .07, ease: "power3.out", clearProps: "transform,opacity,visibility,willChange" }, "-=.45");
        timelines.push(timeline);
      });
    };
    if (document.fonts.status === "loaded") setup(); else void document.fonts.ready.then(setup);
    return () => { cancelled = true; timelines.forEach(timeline => timeline.kill()); splits.forEach(split => split.revert()); };
  }, { dependencies: [pathname, isPageReady], revertOnUpdate: true });
  return null;
}
