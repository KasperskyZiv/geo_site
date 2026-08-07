import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile these workspace libs from TS/JSX source — no separate build step. This is
  // what makes `@geo/ui` and `@geo/analytics` (a "use client" provider) "just work".
  transpilePackages: ["@geo/ui", "@geo/analytics"],

  // Pin the workspace root to the repo so Next doesn't guess it from a stray lockfile
  // higher up (which resolves a second React copy and crashes prerendering).
  outputFileTracingRoot: path.join(import.meta.dirname, "..", ".."),

  // Baseline security headers — see apps/web/next.config.ts for the CSP/centralization note.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
