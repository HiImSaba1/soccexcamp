"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { gsap } from "@/lib/motion/gsap";
import { useLocale } from "@/providers/LocaleProvider";

export function HomeAboutIntro() {
  const { dictionary: d, locale } = useLocale();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;

      if (!section) return;

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
      ) {
        return;
      }

      const eyebrow = section.querySelector<HTMLElement>(
        "[data-about-eyebrow]"
      );

      const media = section.querySelector<HTMLElement>(
        "[data-about-media]"
      );

      const copy = section.querySelector<HTMLElement>(
        "[data-about-copy]"
      );

      if (!eyebrow || !media || !copy) {
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(
          eyebrow,
          {
            y: 18,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.65,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          }
        )
        .fromTo(
          media,
          {
            clipPath: "inset(0 0 100% 0)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.15,
            ease: "power4.inOut",
            clearProps: "clipPath",
          },
          "-=0.35"
        )
        .fromTo(
          copy.children,
          {
            y: 28,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            clearProps:
              "transform,opacity,visibility",
          },
          "-=0.55"
        );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    {
      scope: root,
      dependencies: [locale],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={root}
      className="home-about"
      data-motion-owner
    >
      <p data-about-eyebrow>{d.about.eyebrow}</p>

      <SplitReveal className="about-title">
        {d.about.title}
      </SplitReveal>

      <div data-about-media className="about-media-reveal">
        <ParallaxImage
          className="about-media about-media--contain"
          imageClassName="about-media__asset"
          src="/media/soccerxcamp/june-2024-team.jpg"
          alt={
            locale === "el"
              ? "Η ομάδα του SoccerX Camp δίπλα στον αγωνιστικό χώρο"
              : "The SoccerX Camp team beside the football pitch"
          }
          sizes="(max-width: 700px) 100vw, 42vw"
          speed={4}
        />
      </div>

      <div
        className="about-copy"
        data-about-copy
      >
        <p>{d.about.body}</p>

        <EditorialButton
          href="/about"
          label={d.about.cta}
          tone="dark"
        />
      </div>
    </section>
  );
}