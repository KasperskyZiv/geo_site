import type { Metadata } from "next";
import { Geist, Geist_Mono, Neucha } from "next/font/google";
import "./globals.css";
import { Analytics, ConsentBanner } from "@geo/analytics";
import { JsonLd, organizationJsonLd, pageMetadata, websiteJsonLd } from "@geo/seo";
import { SITE_URL } from "./seo";

const NAME = "Kordi";
const DESCRIPTION =
  "When a developer asks their coding agent what to install, one tool gets named — usually not yours. Kordi tracks every recommendation across Claude Code, Cursor and Copilot, shows who wins and why, and hands you the fix list to become the default.";

// Brand type: Geist for body, Geist Mono for terminal/UI chips, Neucha for the
// hand-sketched display voice. Exposed as CSS vars so Tailwind arbitrary values
// (font-[family-name:var(--font-hand)]) can reach them anywhere.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const neucha = Neucha({ weight: "400", subsets: ["latin"], variable: "--font-hand" });

// One door for metadata — pageMetadata() fills metadataBase, canonical, OG, twitter, and
// the `%s — Kordi` title template from @geo/config. No hand-rolled OG here.
export const metadata: Metadata = pageMetadata({
  description: DESCRIPTION,
  tagline: "be seen where builders ask",
});

// Sitewide structured data (schema.org) for rich results — Organization + WebSite, built
// by @geo/seo. Per Google's AI guide this is for rich results, not an AI ranking lever.
const structuredData = [
  organizationJsonLd({ name: NAME, url: SITE_URL }),
  websiteJsonLd({ name: NAME, url: SITE_URL, description: DESCRIPTION }),
];

// PUBLIC surface — no auth, never redirects on session. Same shared <Analytics/>
// provider as apps/web, so a visitor here and the same person signed into the app
// resolve to ONE PostHog person (cross-subdomain identity) — the full funnel.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${neucha.variable}`}>
      <body
        className="min-h-screen bg-[var(--kd-bg)] text-[var(--kd-ink)] antialiased"
        style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
      >
        <JsonLd data={structuredData} />
        <Analytics>{children}</Analytics>
        {/* GDPR: analytics stay dormant until the visitor accepts here. */}
        <ConsentBanner policyHref="/privacy" />
      </body>
    </html>
  );
}
