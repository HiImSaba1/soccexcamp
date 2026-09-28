"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

const NATIVE_SCROLL_ROUTES = ["/apply", "/contact"];

function shouldUseNativeScroll(pathname: string) {
  return NATIVE_SCROLL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches || shouldUseNativeScroll(pathname)) {
      document.documentElement.removeAttribute("data-lenis");
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    document.documentElement.dataset.lenis = "true";

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(raf);

    // Lenis already controls the interpolation timing.
    // Prevent GSAP's ticker smoothing from introducing additional latency.
    gsap.ticker.lagSmoothing(0);

    const refresh = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(refresh);
    });

    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);

      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(raf);

      lenis.destroy();

      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }

      document.documentElement.removeAttribute("data-lenis");
    };
  }, [pathname]);

  /*
   * Refresh ScrollTrigger after route content has had a chance to settle.
   * This is particularly useful for image/layout changes between Next routes.
   */
  useEffect(() => {
    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      });

      return () => cancelAnimationFrame(secondFrame);
    });

    return () => cancelAnimationFrame(firstFrame);
  }, [pathname]);

  return null;
}