import type { NextConfig } from "next";
import redirects from "./migration/generated/redirects.json";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: "/media/wordpress/1257-Talentebuch-final.pdf",
        headers: [
          { key: "Content-Disposition", value: 'attachment; filename="SoccerXCamp-U23-Talentbook-2023.pdf"' },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/media/wordpress/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
