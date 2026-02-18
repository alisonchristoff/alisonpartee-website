"use client";

import { useState } from "react";

const EMAIL = "alisonpartee.media@gmail.com";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="contact" style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 28px 120px" }}>
      <p
        style={{
          fontFamily: "var(--font-overpass-mono), monospace",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-light)",
          marginBottom: 40,
        }}
      >
        Get in Touch
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(28px, 3vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              margin: "0 0 24px",
            }}
          >
            Open for project inquiries and collaboration.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--ink-muted)",
            }}
          >
            Available for freelance work in data analysis, UX design, systems
            automation, and workflow design. Indianapolis-based, open to remote.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
          <a
            href="https://www.linkedin.com/in/alisonirl/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "white",
              background: "var(--accent)",
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: 3,
              display: "inline-block",
              textAlign: "center",
            }}
          >
            Connect on LinkedIn →
          </a>
          <button
            onClick={handleCopy}
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: copied ? "var(--accent)" : "var(--ink)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "14px 24px",
              borderRadius: 3,
              cursor: "pointer",
              textAlign: "center",
              transition: "color 0.2s, border-color 0.2s",
              borderColor: copied ? "var(--accent)" : "var(--border)",
            }}
          >
            {copied ? "Copied!" : "Copy Email Address"}
          </button>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 13,
              color: "var(--ink-light)",
              margin: 0,
            }}
          >
            Indianapolis, IN · Remote-friendly
          </p>
        </div>
      </div>
    </section>
  );
}
