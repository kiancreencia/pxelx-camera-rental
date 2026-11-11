import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: this site renders per request (live availability, today's date).
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
