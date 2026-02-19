import Link from "next/link";
import FrictionParadoxWrapper from "@/components/FrictionParadoxWrapper";

export const metadata = {
  title: "The Friction Paradox — Alison Partee",
  description:
    "An interactive data dashboard exploring how removing friction from daily tasks created hidden costs: impulse spending, psychological detachment from money, loss of human interaction, and reduced sense of accomplishment.",
};

export default function FrictionParadoxPage() {
  return (
    <main style={{ background: "var(--bg)" }}>
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
              The Friction Paradox
            </span>
          </span>
        </div>
      </div>

      {/* Dashboard */}
      <FrictionParadoxWrapper />
    </main>
  );
}
