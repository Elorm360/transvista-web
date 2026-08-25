import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Parent folder also has a package-lock.json, which made Turbopack
    // treat C:\Users\user as the app root and skip this project's env files.
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
  },
};

export default nextConfig;
