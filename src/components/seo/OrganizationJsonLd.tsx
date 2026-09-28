import { siteContact } from "@/content/site-contact";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "SoccerX Camp",
    url: "https://www.soccerxcamp.com",
    logo: "https://www.soccerxcamp.com/media/wordpress/161-soccer_x_camp_logo_ok.png",
    description: "International football trials and scouting experiences for ambitious young players.",
    email: siteContact.emails.map(item => item.label),
    contactPoint: siteContact.phones.map((item, index) => ({ "@type": "ContactPoint", telephone: item.label, contactType: "customer support", areaServed: index === 0 ? "GR" : "DE", availableLanguage: ["English", "Greek", "German"] })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
