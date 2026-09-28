import type { Metadata } from "next";
import { EventArchivePage } from "@/components/core/EventArchivePage";

export const metadata: Metadata = { title: "Germany 2026 Archive", description: "Archive of the SoccerX Trials Germany event held 6–12 April 2026.", alternates: { canonical: "/events/germany-2026" }, robots: { index: true, follow: true }, openGraph: { title: "SoccerX Trials Germany 2026 Archive", description: "Event information and media from the April 2026 Germany trials.", url: "/events/germany-2026", images: [{ url: "/media/wordpress/2678-soccerxcamp_april_trails_germany_main.jpg", alt: "SoccerX Trials Germany" }] } };
export default function Page() { return <EventArchivePage />; }
