import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { AppShell } from "@/components/layout/AppShell";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { dictionaries } from "@/i18n/dictionaries";
import { localeCookieName, normalizeLocale } from "@/i18n/config";
import "./globals.css";
import "./layout-system.css";
import "./ui-system.css";
import "./hero-system.css";
import "./story-system.css";
import "./canvas-system.css";
import "./form-system.css";
import "./motion-system.css";
import "./home-editorial-system.css";
import "./core-media-system.css";
import "yet-another-react-lightbox/styles.css";

const inter = localFont({
  src: [
    { path: "../../public/fonts/Inter/Inter-VariableFont_opsz,wght.ttf", style: "normal", weight: "100 900" },
    { path: "../../public/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf", style: "italic", weight: "100 900" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.soccerxcamp.com"),
  title: { default: "SoccerX Camp", template: "%s | SoccerX Camp" },
  description: "International football trials and scouting experiences for ambitious young players.",
  alternates: { canonical: "/" },
  openGraph: { title: "SoccerX Camp", description: "International football trials and scouting experiences.", url: "/", siteName: "SoccerX Camp", type: "website", images: [{ url: "/media/wordpress/499-soccerxcamp.jpg", width: 1024, height: 610, alt: "SoccerX Camp" }] },
  twitter: { card: "summary_large_image", title: "SoccerX Camp", description: "International football trials and scouting experiences.", images: ["/media/wordpress/499-soccerxcamp.jpg"] },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = normalizeLocale((await cookies()).get(localeCookieName)?.value);
  return <html lang={locale} className={inter.variable} data-scroll-behavior="smooth"><body><OrganizationJsonLd /><AppShell locale={locale} dictionary={dictionaries[locale]}>{children}</AppShell></body></html>;
}
