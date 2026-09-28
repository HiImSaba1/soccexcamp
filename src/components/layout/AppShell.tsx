"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LetterHoverLink } from "@/components/ui/LetterHoverLink";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LocaleProvider, useLocale } from "@/providers/LocaleProvider";
import { siteContact } from "@/content/site-contact";
import { PageTransitionProvider } from "@/providers/PageTransitionProvider";
import { GlobalRevealChoreography } from "@/components/motion/GlobalRevealChoreography";

const navigation = [
  ["/", "home"], ["/events/germany-2026", "event"], ["/about", "about"],
  ["/success-stories", "success"], ["/talentbook", "talentbook"],
  ["/contact", "contact"], ["/apply", "apply"], ["/privacy", "privacy"],
] as const;

function Header() {
  const { locale, dictionary: d } = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const next = locale === "en" ? "el" : "en";
  const redirect = `${pathname}${search.size ? `?${search}` : ""}`;

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY >= 150);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const timer = open ? window.setTimeout(() => menu.current?.querySelector<HTMLAnchorElement>("nav a")?.focus(), 50) : undefined;
    return () => { document.documentElement.style.overflow = ""; if (timer) window.clearTimeout(timer); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault(); setOpen(false); menuButton.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header" data-open={open ? "true" : undefined} data-scrolled={scrolled ? "true" : undefined}>
      <Link href="/" className="site-header__logo" aria-label="SoccerX Camp — Home" onClick={() => setOpen(false)}><Image src="/media/wordpress/161-soccer_x_camp_logo_ok.png" alt="" width={500} height={500} sizes="(max-width: 700px) 5.75rem, 7rem" priority /></Link>
      <div className="site-header__actions">
        <a className="site-header__locale" data-no-page-transition href={`/api/locale?locale=${next}&redirect=${encodeURIComponent(redirect)}`}>{next === "el" ? "GR" : "EN"}</a>
        <Link className="site-header__apply" href="/apply" onClick={() => setOpen(false)}>{d.apply}</Link>
        <button ref={menuButton} className="site-header__menu-button" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(value => !value)}>
          <span>{open ? d.close : d.menu}</span><span aria-hidden="true">{open ? <X /> : <Menu />}</span>
        </button>
      </div>
      <div ref={menu} id="site-menu" className="site-menu" aria-hidden={!open}>
        <nav aria-label={d.navigationLabel}>
          {navigation.map(([href, key], index) => <LetterHoverLink key={href} href={href} leadingVisual={<span>0{index + 1}</span>} tabIndex={open ? undefined : -1} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{d.nav[key]}</LetterHoverLink>)}
        </nav>
        <div className="site-menu__foot"><p>SOCCERX CAMP<br />GERMANY ’26</p><div className="site-menu__contacts"><p>{siteContact.phones.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</p><p>{siteContact.emails.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</p></div></div>
      </div>
    </header>
  );
}

function Footer() {
  const { dictionary: d } = useLocale();
  return <footer className="site-footer">
    <div className="site-footer__brand"><Link href="/" className="site-footer__logo" aria-label="SoccerX Camp — Home"><Image src="/media/wordpress/161-soccer_x_camp_logo_ok.png" alt="" width={500} height={500} sizes="8rem" /></Link><p>{d.footer.statement}</p></div>
    <div className="site-footer__columns">
      <nav aria-label={d.footer.navigationLabel}><h2>{d.footer.links}</h2><LetterHoverLink href="/events/germany-2026">{d.nav.event}</LetterHoverLink><LetterHoverLink href="/about">{d.nav.about}</LetterHoverLink><LetterHoverLink href="/success-stories">{d.nav.success}</LetterHoverLink><LetterHoverLink href="/contact">{d.nav.contact}</LetterHoverLink></nav>
      <address><h2>{d.nav.contact}</h2><div className="site-footer__contact">{siteContact.phones.map(item => <LetterHoverLink key={item.href} href={item.href}>{item.label}</LetterHoverLink>)}{siteContact.emails.map(item => <LetterHoverLink key={item.href} href={item.href}>{item.label}</LetterHoverLink>)}</div></address>
    </div>
    <div className="site-footer__bottom"><p>© {new Date().getFullYear()} SoccerX Camp</p><LetterHoverLink className="site-footer__credit" href="https://www.sabaweb.gr" target="_blank" rel="noreferrer">By Saba Web Solutions</LetterHoverLink><LetterHoverLink href="/privacy">{d.nav.privacy}</LetterHoverLink></div>
  </footer>;
}

function FooterCurtain({ children }: { children: ReactNode }) {
  const curtainRef = useRef<HTMLDivElement>(null); const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const curtain = curtainRef.current; const content = contentRef.current; if (!curtain || !content) return;
    const updateHeight = () => curtain.style.setProperty("--footer-curtain-height", `${content.scrollHeight}px`);
    updateHeight(); const observer = new ResizeObserver(updateHeight); observer.observe(content); window.addEventListener("load", updateHeight);
    return () => { observer.disconnect(); window.removeEventListener("load", updateHeight); };
  }, []);
  return <div className="footer-curtain" ref={curtainRef}><div className="footer-curtain__track"><div className="footer-curtain__sticky" ref={contentRef}>{children}</div></div></div>;
}

export function AppShell({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  return <LocaleProvider locale={locale} dictionary={dictionary}><PageTransitionProvider><a className="skip-link" href="#main">{dictionary.skip}</a><Header /><div className="site-surface"><main id="main">{children}</main></div><FooterCurtain><Footer /></FooterCurtain><GlobalRevealChoreography /></PageTransitionProvider></LocaleProvider>;
}
