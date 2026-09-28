import type { NextConfig } from "next";
import redirects from "./migration/generated/redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
