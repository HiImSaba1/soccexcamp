import type { Metadata } from "next";
import { CorePage } from "@/components/core/CorePage";
import { SpecialistGrid } from "@/components/core/SpecialistGrid";

export const metadata: Metadata = { title: "About", description: "Meet the team and international football network behind SoccerX Camp.", alternates: { canonical: "/about" }, openGraph: { title: "About SoccerX Camp", description: "International coaching, management and scouting perspectives.", url: "/about", images: [{ url: "/media/wordpress/2005-tasos_petkakis_scouters_soccerxcamp_fifa.jpg", alt: "SoccerX Camp team" }] }, twitter: { card: "summary_large_image", title: "About SoccerX Camp", description: "International coaching, management and scouting perspectives.", images: ["/media/wordpress/2005-tasos_petkakis_scouters_soccerxcamp_fifa.jpg"] } };
export default function Page() { return <><CorePage page="about" /><SpecialistGrid /></>; }
