"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/motion/gsap";

type SplitRevealProps = {
  children: string;
  className?: string;
};

export function SplitReveal({
  children,
  className,
}: SplitRevealProps) {
  const root = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const element = root.current;

      if (!element) return;

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
      ) {
        return;
      }

      let split: SplitText | undefined;
      let tween: gsap.core.Tween | undefined;
      let cancelled = false;

      const setup = () => {
        if (cancelled || !element.isConnected) {
          return;
        }

        split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
        });

        if (!split.lines.length) {
          return;
        }

        gsap.set(split.lines, {
          yPercent: 110,
          autoAlpha: 0,
          willChange: "transform",
        });

        tween = gsap.to(split.lines, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power4.out",
          clearProps:
            "transform,opacity,visibility,willChange",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
            invalidateOnRefresh: true,
          },
        });
      };

      if (document.fonts.status === "loaded") {
        setup();
      } else {
        void document.fonts.ready.then(setup);
      }

      return () => {
        cancelled = true;
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
      };
    },
    {
      scope: root,
      dependencies: [children],
      revertOnUpdate: true,
    }
  );

  return (
    <h2
      ref={root}
      className={className}
      data-no-global-reveal
    >
      {children}
    </h2>
  );
}