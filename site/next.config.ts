import type { NextConfig } from "next";

// Static export for GitHub Pages; BASE_PATH is "/mheval-leaderboard" in CI and empty locally.
const config: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
