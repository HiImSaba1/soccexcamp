"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/providers/LocaleProvider";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();
  const redirect = `${pathname}${search.size ? `?${search}` : ""}`;

  return <div className="language-switcher" role="group" aria-label="Language">
    {(["el", "en"] as const).map(language => <a key={language} href={`/api/locale?locale=${language}&redirect=${encodeURIComponent(redirect)}`} data-no-page-transition aria-current={locale === language ? "true" : undefined}>{language === "el" ? "GR" : "EN"}</a>)}
  </div>;
}
