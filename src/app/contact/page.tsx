import type { Metadata } from "next";
import { CorePage } from "@/components/core/CorePage";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Contact SoccerX Camp in Greece or Germany about football trials and participation.", alternates: { canonical: "/contact" }, openGraph: { title: "Contact SoccerX Camp", description: "Speak with the SoccerX Camp team about trials and participation.", url: "/contact", images: [{ url: "/media/wordpress/70-soccer_camp_section_2-scaled.jpg", alt: "SoccerX Camp football training" }] }, twitter: { card: "summary_large_image", title: "Contact SoccerX Camp", description: "Speak with the SoccerX Camp team about trials and participation.", images: ["/media/wordpress/70-soccer_camp_section_2-scaled.jpg"] } };

export default function Page() {
  return <><CorePage page="contact" /><ContactForm /></>;
}
