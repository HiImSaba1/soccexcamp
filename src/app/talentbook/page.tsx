import type { Metadata } from "next";
import { TalentbookPage } from "@/components/core/TalentbookPage";

export const metadata: Metadata = { title: "Talentbook", description: "Download the historical SoccerX Camp U23 Talentbook publication.", alternates: { canonical: "/talentbook" }, openGraph: { title: "SoccerX Camp Talentbook", description: "Historical U23 player publication from the SoccerX Camp archive.", url: "/talentbook", images: [{ url: "/media/wordpress/71-kids_playing_2-scaled.jpg", alt: "Young footballers training at SoccerX Camp" }] }, twitter: { card: "summary_large_image", title: "SoccerX Camp Talentbook", description: "Historical U23 player publication from the SoccerX Camp archive.", images: ["/media/wordpress/71-kids_playing_2-scaled.jpg"] } };
export default function Page() { return <TalentbookPage />; }
