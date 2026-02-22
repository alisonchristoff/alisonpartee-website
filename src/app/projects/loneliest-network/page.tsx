import Link from "next/link";
import LoneliestNetworkWrapper from "@/components/LoneliestNetworkWrapper";

export const metadata = {
  title: "The Loneliest Network — Alison Partee",
  description:
    "An interactive data dashboard exploring how technology systematically removed human-to-human interaction from daily life — and how each convenience we gained was also a connection we lost. From self-checkout to dating apps, the data reveals a paradox.",
  openGraph: {
    title: "The Loneliest Network — Alison Partee",
    description:
      "We've never had more ways to connect. We've never been more alone. An interactive data investigation into technology, convenience, and the loneliness epidemic.",
    type: "article",
    url: "https://alisonpartee.com/projects/loneliest-network",
  },
};

export default function LoneliestNetworkPage() {
  return (
    <main style={{ background: "var(--bg)" }}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "The Loneliest Network",
            author: {
              "@type": "Person",
              name: "Alison Partee",
            },
            datePublished: "2026-02-21",
            description:
              "An interactive data dashboard exploring how technology systematically removed human-to-human interaction from daily life — and how each convenience we gained was also a connection we lost.",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px 28px",
        }}
      >
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <span
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--ink-light)",
            }}
          >
            <Link
              href="/projects"
              style={{ color: "var(--ink-light)", textDecoration: "none" }}
            >
              Projects
            </Link>
            {" / "}
            <span style={{ color: "var(--ink-muted)" }}>
              The Loneliest Network
            </span>
          </span>
        </div>
      </div>

      {/* Dashboard */}
      <LoneliestNetworkWrapper />
    </main>
  );
}
