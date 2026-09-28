import type { MetadataRoute } from "next";
import { stories } from "@/content/stories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.soccerxcamp.com";

  const routes = [
    "",
    "/about",
    "/success-stories",
    "/talentbook",
    "/apply",
    "/contact",
    "/privacy",
    "/events/germany-2026",
  ];

  return [
    ...routes.map((route, index) => ({
      url: `${base}${route}`,
      lastModified: new Date("2026-09-28"),
      changeFrequency:
        index === 0 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : 0.7,
    })),

    ...stories.map((story) => ({
      url: `${base}/stories/${story.slug}`,
      lastModified: new Date(story.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}