import type { NextConfig } from "next";

// Static export for GitHub Pages, served at the root of mheval.slingshotai.com. BASE_PATH serves it under a
// subpath instead (e.g. "/mheval-leaderboard" for the github.io URL).
const config: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
