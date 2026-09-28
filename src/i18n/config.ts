export const locales = ["en", "el"] as const;
export type Locale = (typeof locales)[number];
export const localeCookieName = "soccerxcamp_locale";
export function normalizeLocale(value: string | undefined): Locale { return value === "el" ? "el" : "en"; }
