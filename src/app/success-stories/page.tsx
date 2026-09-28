import type { Metadata } from "next";
import { CorePage } from "@/components/core/CorePage";
import { SuccessProfiles } from "@/components/core/SuccessProfiles";
import { StoryArchive } from "@/components/stories/StoryArchive";

export const metadata: Metadata = { title: "Success Stories", description: "Trials, signings and development opportunities connected with SoccerX Camp.", alternates: { canonical: "/success-stories" }, openGraph: { title: "SoccerX Camp Success Stories", description: "Documented football pathways from trials to professional opportunities.", url: "/success-stories", images: [{ url: "/media/wordpress/1540-zannakis_hoffenheim_maragozidis.jpg", alt: "SoccerX Camp success story" }] } };
export default function Page() { return <><CorePage page="success" /><SuccessProfiles /><StoryArchive /></>; }
