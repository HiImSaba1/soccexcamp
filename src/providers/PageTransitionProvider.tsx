"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type TransitionEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type Phase = "idle" | "covering" | "covered" | "revealing";
type Value = { isPageReady: boolean; navigateTo: (href: string) => void };
const Context = createContext<Value | null>(null);
export function usePageTransition() { const value = useContext(Context); if (!value) throw new Error("usePageTransition must be used inside PageTransitionProvider."); return value; }

function bypass(pathname: string) { return pathname === "/api" || pathname.startsWith("/api/"); }

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [phase, setPhase] = useState<Phase>("idle"); const [isPageReady, setIsPageReady] = useState(true);
  const destination = useRef<string | null>(null); const destinationPath = useRef<string | null>(null);
  const reveal = useCallback(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); setIsPageReady(true); document.documentElement.dataset.routeReady = "true"; requestAnimationFrame(() => requestAnimationFrame(() => setPhase("revealing"))); }, []);
  useEffect(() => { if (phase === "covered" && destinationPath.current === pathname) reveal(); }, [pathname, phase, reveal]);
  const navigateTo = useCallback((href: string) => {
    const next = new URL(href, window.location.href); const target = `${next.pathname}${next.search}${next.hash}`; const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (phase !== "idle" || target === current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || bypass(pathname) || bypass(next.pathname)) { router.push(target); return; }
    destination.current = target; destinationPath.current = next.pathname; setIsPageReady(false); document.documentElement.dataset.routeReady = "false"; setPhase("covering");
  }, [pathname, phase, router]);
  function finish(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (phase === "covering" && destination.current) { const samePath = destinationPath.current === pathname; setPhase("covered"); router.push(destination.current, { scroll: false }); if (samePath) requestAnimationFrame(reveal); return; }
    if (phase === "revealing") { destination.current = null; destinationPath.current = null; setPhase("idle"); }
  }
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank" || anchor.hasAttribute("data-no-page-transition")) return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin || (next.hash && next.pathname === pathname && next.search === window.location.search)) return;
      event.preventDefault(); navigateTo(`${next.pathname}${next.search}${next.hash}`);
    };
    document.addEventListener("click", handleClick, true); return () => document.removeEventListener("click", handleClick, true);
  }, [navigateTo, pathname]);
  const covered = phase === "covering" || phase === "covered";
  return <Context.Provider value={{ isPageReady, navigateTo }}>{children}<div aria-hidden="true" data-transition-state={phase} className="page-transition-curtain" onTransitionEnd={finish} style={{ transform: covered ? "translateY(0)" : phase === "revealing" ? "translateY(-100%)" : "translateY(100%)", visibility: phase === "idle" ? "hidden" : "visible", transition: phase === "idle" ? "none" : "transform 850ms cubic-bezier(.77,0,.18,1)" }}><div className="page-transition-curtain__brand"><Image src="/media/wordpress/161-soccer_x_camp_logo_ok.png" alt="" width={500} height={500} sizes="clamp(7rem, 15vw, 11rem)" priority /><span>SOCCER <strong>X</strong> CAMP</span></div></div></Context.Provider>;
}
