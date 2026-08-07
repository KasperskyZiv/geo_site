import { pageMetadata } from "@geo/seo";
import { SiteFooter, SiteNav } from "../home/site-chrome";
import { ReportForm } from "./report-form";

export const metadata = pageMetadata({
  description:
    "Get a free Kordi visibility report: 60 buying prompts run across five models and four coding agents, with every recommendation and citation logged. In your inbox within 24 hours.",
  tagline: "get your free agent visibility report",
  path: "/report",
});

// Server shell + client form child (public page: must not be root-client).
export default function ReportPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-14 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <h1
            className="text-4xl leading-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-hand), cursive" }}
          >
            See who the agents name in your category
          </h1>
          <p className="text-lg leading-relaxed text-[var(--kd-ink-soft)]">
            60 prompts across five models and four coding agents — the questions your buyers and
            their engineers actually ask. We log who gets recommended, in what order, with which
            sources cited, and send you the report with the first three fixes.
          </p>
          <ul className="flex flex-col gap-2 text-[15px] text-[var(--kd-ink-soft)]">
            <li>✓ Report in your inbox within 24 hours</li>
            <li>✓ A real person walks you through it</li>
            <li>✓ Free, no card, no strings</li>
          </ul>
        </div>
        <ReportForm />
      </main>
      <SiteFooter />
    </>
  );
}
