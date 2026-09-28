import type { NextConfig } from "next";

const apiOrigin = process.env.VELORA_API_INTERNAL_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${apiOrigin.replace(/\/$/, "")}/api/:path*`,
    }];
  },
};

export default nextConfig;
