"use client";

import Image, { type ImageProps } from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { clsx } from "clsx";
import { gsap } from "@/lib/motion/gsap";

type ParallaxImageProps = Omit<ImageProps, "fill"> & {
  className?: string;
  imageClassName?: string;
  speed?: number;
};

export function ParallaxImage({
  alt,
  className,
  imageClassName,
  speed = 12,
  sizes = "(max-width: 768px) 100vw, 50vw",
  ...imageProps
}: ParallaxImageProps) {
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootElement = root.current;
      const mediaElement = media.current;

      if (!rootElement || !mediaElement) {
        return;
      }

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
      ) {
        return;
      }

      gsap.fromTo(
        mediaElement,
        {
          yPercent: -speed,
        },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: {
            trigger: rootElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    {
      scope: root,
      dependencies: [speed],
      revertOnUpdate: true,
    }
  );

  return (
    <div
      ref={root}
      className={clsx("parallax-image", className)}
      data-no-global-reveal
    >
      <div
        ref={media}
        className="parallax-image__media"
      >
        <Image
          {...imageProps}
          alt={alt}
          fill
          sizes={sizes}
          className={clsx(
            "parallax-image__asset",
            imageClassName
          )}
        />
      </div>
    </div>
  );
}