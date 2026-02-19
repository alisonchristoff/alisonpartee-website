"use client";

import dynamic from "next/dynamic";

const FrictionParadoxDashboard = dynamic(
  () => import("@/components/FrictionParadoxDashboard"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-overpass-mono), monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--ink-light)",
          textTransform: "uppercase",
        }}
      >
        Loading dashboard...
      </div>
    ),
  }
);

export default function FrictionParadoxWrapper() {
  return <FrictionParadoxDashboard />;
}
