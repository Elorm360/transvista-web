import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Parent folder also has a package-lock.json, which made Turbopack
    // treat C:\Users\user as the app root and skip this project's env files.
    root: path.join(__dirname),
  },
};

export default nextConfig;
