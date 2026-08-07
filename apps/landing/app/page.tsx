import { JsonLd, faqJsonLd, pageMetadata } from "@geo/seo";
import { FAQ } from "./home/copy";
import { Faq } from "./home/faq";
import { FinalCta } from "./home/final-cta";
import { Hero } from "./home/hero";
import { HowItWorks } from "./home/how-it-works";
import { MomentOfTruth } from "./home/moment-of-truth";
import { Positioning } from "./home/positioning";
import { PowerUps } from "./home/power-ups";
import { ScrollFilm } from "./home/scroll-film";
import { SiteFooter, SiteNav } from "./home/site-chrome";
import { Thesis } from "./home/thesis";

// This page's canonical metadata — one door (@geo/seo). The layout sets the site
// default + `%s` template; this pins the "/" canonical + OG for the home route.
export const metadata = pageMetadata({
  description:
    "Kordi tracks what coding agents recommend in your category — Claude Code, Cursor, Copilot, Windsurf — shows who wins and why, and hands you the fix list to become the default.",
  tagline: "be seen where builders ask",
  path: "/",
});

// Customer journey: panic → proof → relief. Hero (seen vs unseen) → the story film
// → the thesis (this page is the white paper) → watching the loss happen live →
// "keep Profound" positioning → what you get → how it works → FAQ → the exit CTA.
export default function Landing() {
  return (
    <>
      <JsonLd data={[faqJsonLd(FAQ.map(({ q, a }) => ({ question: q, answer: a })))]} />
      <SiteNav />
      <main>
        <Hero />
        <ScrollFilm />
        <Thesis />
        <MomentOfTruth />
        <Positioning />
        <PowerUps />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
