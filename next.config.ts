// Next.js configuration for static export (GitHub Pages friendly)
import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/word-games"

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Generate unique build ID for cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;