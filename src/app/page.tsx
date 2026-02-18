import Link from "next/link";
import ContactSection from "@/components/ContactSection";

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
    slug: "ai-displacement",
    tag: "Data Investigation",
    title: "What We Study vs. What AI Disrupts",
    description:
      "An interactive analysis of 12 years of U.S. degree completion data mapped against AI disruption forecasts from BLS, Goldman Sachs, McKinsey, and frontier AI labs. Which fields are students flooding into — and how exposed are they?",
    tools: ["React", "Recharts", "IPEDS Data", "BLS", "Goldman Sachs"],
    featured: true,
  },
  {
    slug: "#",
    tag: "Automation",
    title: "Calendar Automation via Instagram + Claude Vision",
    description:
      "A custom automation system that uses Claude's vision API to extract event data from Instagram posts and populate Google Calendar — eliminating manual data entry for local community events.",
    tools: ["Python", "Claude API", "Google Calendar API", "Instagram"],
    featured: false,
  },
];

const experience = [
  {
    company: "Automation Systems",
    role: "Freelance",
    period: "Apr 2025 – Present",
    description:
      "Design and build automated systems that simplify repetitive work through practical code and thoughtful workflows. Projects include a calendar automation system using Claude's vision API, data processing pipelines, and workflow automation solutions.",
    tags: ["Python", "Claude API", "System Architecture", "API Integration"],
  },
  {
    company: "Indiana Commission for Higher Education",
    role: "Director of User Experience",
    period: "Jan 2022 – Jun 2025",
    description:
      "Transformed how Indiana's higher education data reached stakeholders and the public by applying UX principles to complex information systems. Directed the 2024 State of Higher Education Report. Led UX redesign of Tableau dashboards and automated reporting systems.",
    tags: ["UX Design", "Tableau", "SQL Server", "Power Automate", "Data Visualization"],
  },
  {
    company: "Indiana Commission for Higher Education",
    role: "Assistant Director of Data Analytics",
    period: "Aug 2020 – Dec 2021",
    description:
      "Led data analytics initiatives for Indiana's statewide higher education system, translating complex data into actionable insights for legislative stakeholders.",
    tags: ["Data Analytics", "SQL", "Reporting", "Stakeholder Communication"],
  },
  {
    company: "Indiana Commission for Higher Education",
    role: "Data Analyst",
    period: "May 2018 – Aug 2020",
    description:
      "Analyzed higher education data and built reporting systems supporting policy decisions across Indiana's postsecondary institutions.",
    tags: ["Data Analysis", "SQL", "Reporting"],
  },
  {
    company: "Disease Ecology Laboratory, Indiana University",
    role: "Systems Ecology Researcher",
    period: "2016 – 2018",
    description:
      "Built ecological predictive models to understand behavioral patterns of disease spread in dynamic systems. Authored senior undergraduate thesis on predator-prey influences within disease systems using computational modeling.",
    tags: ["Mathematical Modeling", "R", "Population Ecology"],
  },
];

const skills = [
  { category: "Design & UX", items: ["User Research", "Information Architecture", "Data Visualization", "Tableau", "Figma"] },
  { category: "Automation & Systems", items: ["Microsoft Power Automate", "Azure DevOps", "Python", "API Integration", "Workflow Design"] },
  { category: "Data & Analytics", items: ["SQL Server", "Data Analysis", "Statistical Modeling", "IPEDS", "Dashboard Design"] },
  { category: "AI & Development", items: ["Claude API", "React", "Next.js", "Prompt Engineering", "Agentic Workflows"] },
];

export default function Home() {
  return (
    <main style={{ background: "var(--bg)" }}>

      {/* ═══ HERO ═══ */}
      <section style={{ ...wrap, padding: "80px 28px 64px" }}>
        <p style={{ ...mono, marginBottom: 24 }}>UX Designer · Systems Builder · Indianapolis, IN</p>
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "clamp(42px, 6vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.06,
            margin: "0 0 32px",
            maxWidth: 820,
          }}
        >
          I build systems that turn data into <em>decisions.</em>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 20,
            lineHeight: 1.65,
            color: "var(--ink-muted)",
            maxWidth: 600,
            margin: "0 0 48px",
          }}
        >
          7+ years at the intersection of data analytics and UX design. Former Director
          of User Experience at the Indiana Commission for Higher Education. Now building
          AI-powered automation systems and exploring what comes next.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link
            href="/projects"
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "white",
              background: "var(--accent)",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: 3,
            }}
          >
            View Projects
          </Link>
          <a
            href="#experience"
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink)",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: 3,
              border: "1px solid var(--border)",
            }}
          >
            Experience
          </a>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ═══ FEATURED PROJECT ═══ */}
      <section style={{ ...wrap, padding: "80px 28px" }}>
        <p style={{ ...mono, marginBottom: 40 }}>Featured Work</p>

        {projects.map((p) => (
          <div
            key={p.slug}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              padding: "48px 0",
              borderTop: "1px solid var(--border-light)",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ ...mono, color: "var(--accent)", marginBottom: 16 }}>{p.tag}</p>
              <h2
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "clamp(26px, 3vw, 36px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: "0 0 20px",
                }}
              >
                {p.title}
              </h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
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
                      letterSpacing: "0.06em",
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
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "var(--ink-muted)",
                  margin: "0 0 28px",
                }}
              >
                {p.description}
              </p>
              {p.slug !== "#" && (
                <Link
                  href={`/projects/${p.slug}`}
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
                  View Interactive Dashboard →
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ═══ ABOUT ═══ */}
      <section style={{ ...wrap, padding: "80px 28px" }}>
        <p style={{ ...mono, marginBottom: 40 }}>About</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "clamp(28px, 3vw, 38px)",
                fontWeight: 400,
                lineHeight: 1.2,
                margin: "0 0 24px",
              }}
            >
              Making technology that serves people, not the other way around.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "var(--ink-muted)",
                margin: "0 0 20px",
              }}
            >
              I've spent 7+ years turning complex data into actionable insights, and I
              learned that the best analysis in the world means nothing if nobody can
              understand or use it. That's why I focus on the intersection of data
              analytics and user experience.
            </p>
            <p
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "var(--ink-muted)",
              }}
            >
              I believe in intentional design choices, thoughtful automation, and the
              idea that the best systems are the ones people <em>want</em> to use.
            </p>
          </div>
          <div>
            <div style={{ marginBottom: 40 }}>
              <p style={{ ...mono, marginBottom: 20 }}>Education</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      margin: "0 0 4px",
                    }}
                  >
                    Graduate Certificate, Human-Computer Interaction
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-overpass-mono), monospace",
                      fontSize: 11,
                      color: "var(--ink-light)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Indiana University Indianapolis · 2021–2025
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      margin: "0 0 4px",
                    }}
                  >
                    B.S. Mathematics
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-overpass-mono), monospace",
                      fontSize: 11,
                      color: "var(--ink-light)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Indiana University Bloomington · 2014–2018
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p style={{ ...mono, marginBottom: 20 }}>Skills</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {skills.map((s) => (
                  <div key={s.category}>
                    <p
                      style={{
                        fontFamily: "var(--font-overpass-mono), monospace",
                        fontSize: 10,
                        color: "var(--ink-light)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {s.category}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.items.map((item) => (
                        <span
                          key={item}
                          style={{
                            fontFamily: "var(--font-source-sans), sans-serif",
                            fontSize: 13,
                            color: "var(--ink-muted)",
                            background: "var(--surface-alt)",
                            padding: "4px 10px",
                            borderRadius: 2,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ═══ EXPERIENCE ═══ */}
      <section id="experience" style={{ ...wrap, padding: "80px 28px" }}>
        <p style={{ ...mono, marginBottom: 40 }}>Experience</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {experience.map((e, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 40,
                padding: "36px 0",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-overpass-mono), monospace",
                    fontSize: 10,
                    color: "var(--ink-light)",
                    letterSpacing: "0.06em",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {e.period}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-overpass-mono), monospace",
                    fontSize: 10,
                    color: "var(--accent)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                  }}
                >
                  {e.company}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    margin: "0 0 12px",
                  }}
                >
                  {e.role}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--ink-muted)",
                    margin: "0 0 16px",
                  }}
                >
                  {e.description}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "var(--font-overpass-mono), monospace",
                        fontSize: 10,
                        color: "var(--ink-light)",
                        background: "var(--surface-alt)",
                        padding: "3px 8px",
                        borderRadius: 2,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ═══ CONTACT ═══ */}
      <ContactSection />

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            ...wrap,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 10,
              color: "var(--ink-light)",
              letterSpacing: "0.08em",
            }}
          >
            © {new Date().getFullYear()} ALISON PARTEE
          </span>
          <span
            style={{
              fontFamily: "var(--font-overpass-mono), monospace",
              fontSize: 10,
              color: "var(--ink-light)",
              letterSpacing: "0.08em",
            }}
          >
            INDIANAPOLIS, IN
          </span>
        </div>
      </footer>
    </main>
  );
}
