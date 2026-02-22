import Link from "next/link";

const wrap: React.CSSProperties = {
  maxWidth: 1060,
  margin: "0 auto",
  padding: "0 28px",
};

const mono: React.CSSProperties = {
  fontFamily: "var(--font-overpass-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--ink-light)",
};

const projects = [
  {
    href: "/projects/friction-paradox",
    tag: "Data Investigation · Interactive",
    title: "The Friction Paradox",
    date: "Feb 2026",
    description:
      "An interactive data dashboard exploring how removing friction from daily tasks created hidden costs: impulse spending, psychological detachment from money, loss of human interaction, and reduced sense of accomplishment. Every frictionless improvement is real — but optimization has side effects.",
    tools: ["React", "Recharts", "Behavioral Economics", "Neuroscience Research"],
    status: "Live",
  },
  {
    href: "/projects/ai-displacement",
    tag: "Data Investigation · Interactive",
    title: "What We Study vs. What AI Disrupts",
    date: "Feb 17, 2026",
    description:
      "An interactive analysis of 12 years of U.S. degree completion data (IPEDS 2012–2024) mapped against AI disruption forecasts from the BLS, Goldman Sachs, McKinsey, and frontier AI labs. Which fields are students flooding into — and how exposed are they to automation?",
    tools: ["React", "Recharts", "IPEDS", "BLS", "Goldman Sachs Research"],
    status: "Live",
  },
  {
    href: "/projects/loneliest-network",
    tag: "Data Investigation · Interactive",
    title: "The Loneliest Network",
    date: "Feb 2026",
    description:
      "An interactive data dashboard exploring how technology systematically removed human-to-human interaction from daily life — and how each convenience we gained was also a connection we lost. From self-checkout to dating apps, the data reveals a paradox: we've never had more ways to connect, and we've never been more alone.",
    tools: ["React", "Recharts", "ATUS", "Gallup", "Harvard MCC"],
    status: "Live",
  },
  {
    href: "#",
    tag: "Automation · Python",
    title: "Calendar Automation via Instagram + Claude Vision",
    date: "Sept 2025",
    description:
      "A custom automation system that uses Claude's vision API to extract event data from Instagram posts and populate Google Calendar. Built to eliminate manual data entry for local community event coordination.",
    tools: ["Python", "Claude Vision API", "Google Calendar API", "Instagram"],
    status: "Case Study",
  },
  {
    href: "#",
    tag: "Data Storytelling · Long-form Report",
    title: "2024 State of Higher Education Report",
    date: "Oct 2024",
    description:
      "Led UX and content design for Indiana's 2024 State of Higher Education Report — a 45-page long-form publication, the first aligned with the state's new strategic plan. Combined narrative, charts, and policy data into a cohesive document designed to communicate complex postsecondary trends to legislators and the public.",
    tools: ["SQL Server", "Data Storytelling", "Policy Communication", "Long-form Design"],
    status: "Case Study",
  },
];

export default function ProjectsPage() {
  return (
    <main style={{ background: "var(--bg)" }}>
      <section style={{ ...wrap, padding: "80px 28px 120px" }}>
        <p style={{ ...mono, marginBottom: 24 }}>Projects</p>
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            margin: "0 0 64px",
            maxWidth: 700,
          }}
        >
          Selected work
        </h1>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.map((p, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "48px 0",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 60,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <p style={{ ...mono, color: "var(--accent)", margin: 0 }}>{p.tag}</p>
                  <span
                    style={{
                      fontFamily: "var(--font-overpass-mono), monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color:
                        p.status === "Live" ? "var(--accent)" : "var(--ink-light)",
                      background:
                        p.status === "Live"
                          ? "rgba(232,84,62,0.08)"
                          : "var(--surface-alt)",
                      padding: "3px 8px",
                      borderRadius: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    margin: "0 0 10px",
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-overpass-mono), monospace",
                    fontSize: 10,
                    color: "var(--ink-light)",
                    letterSpacing: "0.08em",
                    margin: "0 0 20px",
                  }}
                >
                  {p.date}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.tools.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "var(--font-overpass-mono), monospace",
                        fontSize: 10,
                        color: "var(--ink-light)",
                        background: "var(--surface-alt)",
                        padding: "4px 10px",
                        borderRadius: 2,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 16,
                    lineHeight: 1.75,
                    color: "var(--ink-muted)",
                    margin: "0 0 28px",
                  }}
                >
                  {p.description}
                </p>
                {p.href !== "#" ? (
                  <Link
                    href={p.href}
                    style={{
                      fontFamily: "var(--font-overpass-mono), monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      textDecoration: "none",
                    }}
                  >
                    View Project →
                  </Link>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-overpass-mono), monospace",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-light)",
                    }}
                  >
                    Case study coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
