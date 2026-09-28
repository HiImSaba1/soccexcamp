import type { Metadata } from "next";

import { CorePage } from "@/components/core/CorePage";
import { ParticipationForm } from "@/components/forms/ParticipationForm";

export const metadata: Metadata = {
  title: "Participation application",

  description:
    "Submit an athlete participation application for SoccerX Camp.",

  alternates: {
    canonical: "/apply",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title:
      "SoccerX Camp participation application",

    description:
      "Apply for a future SoccerX Camp football opportunity.",

    url: "/apply",

    images: [
      {
        url: "/media/soccerxcamp/june-2024-match-05.jpg",
        alt: "Footballers competing at SoccerX Camp",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "SoccerX Camp participation application",

    description:
      "Apply for a future SoccerX Camp football opportunity.",

    images: [
      "/media/soccerxcamp/june-2024-match-05.jpg",
    ],
  },
};

export default function Page() {
  return (
    <>
      <CorePage page="apply" />

      <ParticipationForm />
    </>
  );
}