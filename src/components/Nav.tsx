"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 56,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-overpass-mono), monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          AP
        </Link>

        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color:
                  pathname === href
                    ? "var(--accent)"
                    : "var(--ink-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://www.linkedin.com/in/alisonirl/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink)",
              textDecoration: "none",
              border: "1px solid var(--border)",
              padding: "6px 14px",
              borderRadius: 3,
              transition: "border-color 0.2s, color 0.2s",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}
