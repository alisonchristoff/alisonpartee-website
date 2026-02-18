import Link from "next/link";
import DashboardWrapper from "@/components/DashboardWrapper";

export const metadata = {
  title: "What We Study vs. What AI Disrupts — Alison Partee",
  description:
    "An interactive analysis of 12 years of U.S. degree completion data mapped against AI disruption forecasts from BLS, Goldman Sachs, McKinsey, and frontier AI labs.",
};

export default function AiDisplacementPage() {
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
              AI Displacement Dashboard
            </span>
          </span>
        </div>
      </div>

      {/* Dashboard */}
      <DashboardWrapper />
    </main>
  );
}
