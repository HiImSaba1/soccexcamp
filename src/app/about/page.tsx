import type { Metadata } from "next";
import { CorePage } from "@/components/core/CorePage";
import { SpecialistGrid } from "@/components/core/SpecialistGrid";

export const metadata: Metadata = { title: "About", description: "Meet the team and international football network behind SoccerX Camp.", alternates: { canonical: "/about" }, openGraph: { title: "About SoccerX Camp", description: "International coaching, management and scouting perspectives.", url: "/about", images: [{ url: "/media/wordpress/2005-tasos_petkakis_scouters_soccerxcamp_fifa.jpg", alt: "SoccerX Camp team" }] } };
export default function Page() { return <><CorePage page="about" /><SpecialistGrid /></>; }
