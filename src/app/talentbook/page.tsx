import type { Metadata } from "next";
import { TalentbookPage } from "@/components/core/TalentbookPage";

export const metadata: Metadata = { title: "Talentbook", alternates: { canonical: "/talentbook" } };
export default function Page() { return <TalentbookPage />; }
