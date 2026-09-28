import type { Metadata } from "next";
import { TalentbookPage } from "@/components/core/TalentbookPage";

export const metadata: Metadata = { title: "Talentbook", description: "Download the historical SoccerX Camp U23 Talentbook publication.", alternates: { canonical: "/talentbook" }, openGraph: { title: "SoccerX Camp Talentbook", description: "Historical U23 player publication from the SoccerX Camp archive.", url: "/talentbook", images: [{ url: "/media/soccerxcamp/talentbook-2023-cover.png", alt: "SoccerX Camp U23 Talentbook cover" }] } };
export default function Page() { return <TalentbookPage />; }
