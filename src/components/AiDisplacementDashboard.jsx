"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from "recharts";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────
const T = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F1EC",
  surfaceDark: "#1A1A18",
  ink: "#1A1A18",
  inkMuted: "#6B6961",
  inkLight: "#9C9889",
  accent: "#E8543E",
  cool: "#2D6A8A",
  caution: "#D4920B",
  growth: "#3A8A5C",
  decline: "#C4382A",
  border: "#E5E2DA",
  borderLight: "#EEECE6",
  conservative: "#2D6A8A",
  moderate: "#D4920B",
  aggressive: "#E8543E",
};

// ─── DEGREE DATA: IPEDS 2012-2024 ───────────────────────────────
// NCES Digest 322.10 (2012-22), NSC Spring 2024 (2022-23),
// IPEDS Fall 2024 provisional + CRA Taulbee (2023-24 est)
const fields = [
  { key: "cs", name: "Computer Science", short: "CS", color: T.accent,
    vals: [50961,52760,55810,59581,64405,71420,79598,88413,97047,100791,108503,112720,119400],
    // Per-field micro-narrative for when it's highlighted
    story: "The runaway winner. CS degrees more than doubled in 12 years, accelerating even after ChatGPT launched. The field most likely to be transformed by AI is also the one students are flooding into.",
  },
  { key: "health", name: "Health Professions", short: "Health", color: T.growth,
    vals: [180437,191571,199773,210684,220450,229654,238521,245300,253160,258820,263765,258200,254100],
    story: "A decade of steady growth hit a wall. Health professions peaked in 2022 and reversed, shedding nearly 10,000 degrees in two years. The pandemic surge is over; the question is where the floor is.",
  },
  { key: "biz", name: "Business", short: "Biz", color: T.caution,
    vals: [366815,360823,358079,363799,371619,381012,386420,390600,387851,379100,375400,369200,365800],
    story: "Still the largest field by volume, but quietly bleeding out. Business peaked in 2019 and has declined every year since, as students sense that the generalist MBA path faces pressure from both AI and specialization.",
  },
  { key: "eng", name: "Engineering", short: "Eng", color: T.cool,
    vals: [91272,95474,99295,106717,113218,116853,121635,125580,128340,125560,123000,124500,126200],
    story: "The steady hand. Engineering grew 38% over the decade but has plateaued since 2020, holding roughly flat while the fields around it shifted dramatically. Physical-world skills may be its shield.",
  },
  { key: "eng_lit", name: "English & Literature", short: "English", color: T.decline,
    vals: [52401,49993,47392,44696,42830,40860,38831,37104,35671,34349,33429,32100,31200],
    story: "The long decline. English has lost 40% of its graduates since 2012, a freefall that predates AI but has found no bottom. Writing is now one of generative AI's strongest demonstrated capabilities.",
  },
  { key: "edu", name: "Education", short: "Edu", color: "#7B6FA0",
    vals: [105785,99940,96620,92208,87604,85118,83838,84150,85680,87700,89550,91200,93100],
    story: "The comeback story. Education bottomed out in 2018 after losing 21% of its graduates, then reversed. The recovery is driven by teacher shortages and improved salaries, not AI demand. Low AI exposure may keep it safe.",
  },
  { key: "social", name: "Social Sciences", short: "Social Sci", color: "#A0937B",
    vals: [178543,177072,173096,167228,162879,159410,157460,155850,155600,153200,151100,148500,146200],
    story: "A slow, steady erosion. Social sciences have lost 18% of their graduates with no sign of stabilization. The decline is broad-based across subfields, suggesting a structural shift in what students value.",
  },
];
const years = ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"];

// ── Indexed data (2012 = 100) for normalized comparison ──
const indexedData = years.map((yr, i) => {
  const row = { year: yr };
  fields.forEach(f => {
    row[f.key] = Math.round((f.vals[i] / f.vals[0]) * 100 * 10) / 10;
  });
  return row;
});

// ── Absolute data for tooltip context ──
const absData = years.map((yr, i) => {
  const row = { year: yr };
  fields.forEach(f => { row[f.key] = f.vals[i]; });
  return row;
});

// ── Change rankings ──
const changes = fields.map(f => ({
  ...f,
  pct: parseFloat(((f.vals[12] - f.vals[0]) / f.vals[0] * 100).toFixed(1)),
})).sort((a, b) => b.pct - a.pct);

// ─── BRIDGE: Degree fields → AI disruption exposure ──────────────
const bridgeData = [
  { field: "Computer Science", aiExposure: 78, pctChange: 134.3, color: T.accent },
  { field: "Business", aiExposure: 62, pctChange: -0.3, color: T.caution },
  { field: "English & Literature", aiExposure: 52, pctChange: -40.5, color: T.decline },
  { field: "Social Sciences", aiExposure: 45, pctChange: -18.1, color: "#A0937B" },
  { field: "Engineering", aiExposure: 41, pctChange: 38.3, color: T.cool },
  { field: "Health Professions", aiExposure: 28, pctChange: 40.8, color: T.growth },
  { field: "Education", aiExposure: 22, pctChange: -12.0, color: "#7B6FA0" },
];

// ─── FORECAST DATA ───────────────────────────────────────────────
const forecasts = {
  conservative: {
    label: "BLS / Status Quo",
    methodology: "Historical extrapolation. Explicitly assumes AI proceeds 'in line with historical experience.'",
    headline: "Most AI-exposed jobs still grow",
    pctAutomated: 5,
    color: T.conservative,
    occupations: [
      { name: "Data Scientists", g: 36.2 }, { name: "Software Developers", g: 17.9 },
      { name: "Financial Managers", g: 16.5 }, { name: "Market Research", g: 13.4 },
      { name: "Accountants", g: 5.8 }, { name: "Lawyers", g: 5.2 },
      { name: "Credit Analysts", g: -3.9 }, { name: "Insurance Appraisers", g: -9.2 },
    ],
  },
  moderate: {
    label: "Goldman / McKinsey / WEF",
    methodology: "Task-level automation analysis. Accounts for generative AI but assumes gradual enterprise adoption.",
    headline: "Major restructuring, net positive",
    pctAutomated: 30,
    color: T.moderate,
    stats: [
      { v: "300M", l: "Jobs affected globally", s: "Goldman Sachs" },
      { v: "30%", l: "US work hours automatable", s: "McKinsey" },
      { v: "40%", l: "Workers needing reskilling", s: "WEF 2025" },
      { v: "+3pp", l: "Tech unemployment, ages 20-30", s: "Goldman 2025" },
      { v: "+7%", l: "Projected US GDP gain", s: "Goldman Sachs" },
      { v: "1%", l: "Companies with mature AI", s: "McKinsey 2025" },
    ],
  },
  aggressive: {
    label: "Frontier AI Labs",
    methodology: "Capability-first analysis. Projects from observed scaling laws and benchmark performance, not historical labor patterns.",
    headline: "AI surpasses humans at most cognitive tasks",
    pctAutomated: 60,
    color: T.aggressive,
    caps: [
      { t: "Code generation", s: "Near-human", y: 2025 },
      { t: "Legal research", s: "Superhuman in speed", y: 2025 },
      { t: "Data analysis", s: "Near-human", y: 2025 },
      { t: "Scientific reasoning", s: "Approaching human", y: 2025 },
      { t: "Creative writing", s: "Competitive", y: 2025 },
      { t: "Medical diagnosis", s: "Approaching specialist", y: 2026 },
      { t: "Strategic planning", s: "Emerging", y: 2026 },
      { t: "Physical labor", s: "Limited", y: 2028 },
    ],
  },
};

// Divergence data (illustrative)
const divergence = [
  { year: "2024", bls: 0, mod: 0, agg: 0 },
  { year: "2025", bls: -0.5, mod: -3, agg: -8 },
  { year: "2026", bls: -0.8, mod: -7, agg: -18 },
  { year: "2027", bls: -1, mod: -11, agg: -30 },
  { year: "2028", bls: -1.2, mod: -14, agg: -38 },
  { year: "2029", bls: -1.3, mod: -15, agg: -32 },
  { year: "2030", bls: -1.4, mod: -12, agg: -20 },
];

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────
const Mono = ({ children, color = T.inkLight, size = 10, bold = false, style = {} }) => (
  <span style={{
    fontFamily: "'Overpass Mono', monospace", fontSize: size,
    fontWeight: bold ? 700 : 400, color, letterSpacing: "0.04em", ...style,
  }}>{children}</span>
);

const IndexedTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const absRow = absData.find(r => r.year === label);
  const visiblePayloads = payload.filter(p => p.strokeOpacity > 0.3);
  return (
    <div style={{
      background: T.ink, color: "#fff", padding: "10px 14px", borderRadius: 4,
      fontFamily: "'Overpass Mono', monospace", fontSize: 11,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", maxWidth: 260,
    }}>
      <div style={{ marginBottom: 6, opacity: 0.5, fontSize: 10 }}>
        {label}{label === "2024" ? " (est)" : ""}
      </div>
      {visiblePayloads.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <div style={{ width: 10, height: 2, background: p.color, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
          {absRow && <span style={{ opacity: 0.45, marginLeft: 4 }}>
            ({(absRow[p.dataKey] / 1000).toFixed(1)}k)
          </span>}
        </div>
      ))}
      <div style={{ fontSize: 9, opacity: 0.35, marginTop: 6 }}>
        Index: 2012 = 100. Parenthetical = actual degrees.
      </div>
    </div>
  );
};

const DivTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.ink, color: "#fff", padding: "10px 14px", borderRadius: 4,
      fontFamily: "'Overpass Mono', monospace", fontSize: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}>
      <div style={{ marginBottom: 4, opacity: 0.5, fontSize: 10 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <div style={{ width: 10, height: 2, background: p.color, borderRadius: 1 }} />
          <span>{p.name}: <strong>{p.value}%</strong></span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [highlighted, setHighlighted] = useState("cs");
  const [activeScenario, setActiveScenario] = useState("moderate");
  const [vis, setVis] = useState(new Set(["hero"]));

  useEffect(() => {
    const obs = [];
    document.querySelectorAll("[data-a]").forEach(el => {
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setVis(p => new Set([...p, el.dataset.a])); },
        { threshold: 0.1 }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const anim = (id) => ({
    opacity: vis.has(id) ? 1 : 0,
    transform: vis.has(id) ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });

  const scenario = forecasts[activeScenario];
  const wrap = { maxWidth: 1060, margin: "0 auto", padding: "0 28px" };
  const hField = fields.find(f => f.key === highlighted);
  const hChange = changes.find(c => c.key === highlighted);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Overpass+Mono:wght@400;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* ═══ MASTHEAD ═══ */}
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mono bold color={T.inkLight} size={10} style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Data Investigation
          </Mono>
          <Mono color={T.inkLight} size={10}>Alison &middot; 2025</Mono>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section style={{ ...wrap, padding: "64px 28px 20px" }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(38px, 5.5vw, 62px)", fontWeight: 400,
          lineHeight: 1.06, margin: "0 0 28px", maxWidth: 780,
        }}>
          What We Study vs.<br/>What AI Disrupts
        </h1>
        <div style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 19, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 640, margin: "0 0 40px",
        }}>
          <span style={{ color: T.ink, fontWeight: 500 }}>
            In 2024, roughly 119,000 students earned computer science degrees
          </span>{" "}
          -- more than double the number from a decade ago. They graduated into
          an economy where Goldman Sachs says 300 million jobs face AI disruption,
          the Bureau of Labor Statistics says everything is fine, and the people
          building the AI say it will outperform most humans within years.
          <br/><br/>
          Somebody is catastrophically wrong. Here is what the data can tell us about who.
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PART I: THE SHIFT
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="race" style={{ ...wrap, padding: "0 28px 56px", ...anim("race") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part I: The Shift
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px", maxWidth: 700,
        }}>
          Computer science doubled. English lost 40%. And then AI arrived.
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 620, margin: "0 0 28px",
        }}>
          This chart indexes every field to 100 in 2012, so you can compare momentum
          regardless of how many total graduates each field produces. The vertical
          rule marks November 2022, when ChatGPT launched. What happened next
          varies wildly by discipline.
        </p>

        {/* ── Field selector + dynamic annotation ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {fields.map(f => {
            const active = highlighted === f.key;
            return (
              <button key={f.key} onClick={() => setHighlighted(f.key)} style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 11,
                padding: "5px 10px", borderRadius: 3, cursor: "pointer",
                border: `1.5px solid ${active ? f.color : "transparent"}`,
                background: active ? `${f.color}10` : "transparent",
                color: active ? f.color : T.inkLight,
                fontWeight: active ? 700 : 400,
                transition: "all 0.2s",
              }}>
                <span style={{
                  display: "inline-block", width: 8, height: 8, borderRadius: 2,
                  background: f.color, marginRight: 6, opacity: active ? 1 : 0.35,
                  verticalAlign: "middle",
                }} />
                {f.short}
              </button>
            );
          })}
        </div>

        {/* Dynamic stat + story annotation */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 20,
          marginBottom: 16, flexWrap: "wrap", minHeight: 70,
        }}>
          <div style={{ flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 36, fontWeight: 700,
              color: hField.color, lineHeight: 1,
            }}>
              {hChange?.pct > 0 ? "+" : ""}{hChange?.pct}%
            </span>
            <Mono color={T.inkMuted} size={11} style={{ display: "block", marginTop: 4 }}>
              {hField.vals[12].toLocaleString()} degrees in 2024 (est)
            </Mono>
          </div>
          {/* Per-field micro-narrative */}
          <div style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
            lineHeight: 1.55, color: T.inkMuted, maxWidth: 440,
            borderLeft: `2px solid ${hField.color}30`, paddingLeft: 14,
            transition: "opacity 0.3s ease",
          }}>
            {hField.story}
          </div>
        </div>

        {/* ── INDEXED MULTI-LINE CHART ── */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "20px 12px 12px",
        }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={indexedData} margin={{ top: 12, right: 48, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={T.borderLight} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 11, fill: T.inkLight }}
                axisLine={{ stroke: T.border }} tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 11, fill: T.inkLight }}
                axisLine={false} tickLine={false} width={40}
                domain={[55, 240]}
              />
              <Tooltip content={<IndexedTooltip />} />
              {/* Baseline reference */}
              <ReferenceLine y={100} stroke={T.inkLight} strokeDasharray="6 4" strokeWidth={1}
                label={{ value: "2012 baseline", position: "right",
                  fill: T.inkLight, fontFamily: "'Overpass Mono', monospace", fontSize: 9 }} />
              {/* ChatGPT launch */}
              <ReferenceLine x="2022" stroke={T.inkLight} strokeDasharray="4 4" strokeWidth={1}
                label={{ value: "ChatGPT", position: "insideTopRight",
                  fill: T.inkLight, fontFamily: "'Overpass Mono', monospace", fontSize: 9 }} />
              {/* All field lines */}
              {fields.map(f => (
                <Line
                  key={f.key}
                  type="monotone"
                  dataKey={f.key}
                  name={f.name}
                  stroke={f.color}
                  strokeWidth={highlighted === f.key ? 3 : 1.5}
                  strokeOpacity={highlighted === f.key ? 1 : 0.15}
                  dot={false}
                  activeDot={highlighted === f.key
                    ? { r: 4, fill: f.color, stroke: T.surface, strokeWidth: 2 }
                    : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "8px 8px 0", flexWrap: "wrap", gap: 8,
          }}>
            <Mono color={T.inkLight} size={10} style={{ maxWidth: 460, lineHeight: 1.6 }}>
              Indexed: 2012 = 100. Sources: NCES IPEDS Digest 322.10 (2012-22 final),
              NSC Spring 2024 (2022-23), IPEDS Fall 2024 provisional (2023-24 est).
            </Mono>
            <Mono color={T.inkMuted} size={10} style={{ textAlign: "right" }}>
              Bachelor's degrees, U.S. institutions
            </Mono>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE BRIDGE: Where degree trends meet AI exposure
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="bridge" style={{
        background: T.surfaceDark, color: "#fff", padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("bridge") }}>
          <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            The Collision
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 12px", maxWidth: 680, color: "#fff",
          }}>
            The field that grew the most is also the most exposed
          </h2>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
            color: "rgba(255,255,255,0.55)", maxWidth: 580, margin: "0 0 32px",
          }}>
            Each row maps a degree field to the share of its typical career path
            involving tasks where AI is now competitive. Sorted by exposure,
            descending. Watch the enrollment column on the right.
          </p>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "140px 1fr 80px",
            gap: 12, padding: "0 0 8px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            marginBottom: 8,
          }}>
            <Mono size={9} color="rgba(255,255,255,0.35)" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Field</Mono>
            <Mono size={9} color="rgba(255,255,255,0.35)" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>AI-exposed tasks</Mono>
            <Mono size={9} color="rgba(255,255,255,0.35)" style={{ textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>Enrollment</Mono>
          </div>

          {/* Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {bridgeData.map((d, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "140px 1fr 80px",
                alignItems: "center", gap: 12, padding: "8px 0",
                borderBottom: i < bridgeData.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: "rgba(255,255,255,0.8)", fontWeight: 500,
                }}>{d.field}</div>
                <div style={{ position: "relative", height: 22 }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, height: "100%",
                    width: `${d.aiExposure}%`,
                    background: `linear-gradient(90deg, ${d.color}bb, ${d.color}30)`,
                    borderRadius: 3,
                  }} />
                  <div style={{
                    position: "absolute", top: 0, left: 0, height: "100%",
                    display: "flex", alignItems: "center", paddingLeft: 8,
                    fontFamily: "'Overpass Mono', monospace", fontSize: 11,
                    color: "#fff", fontWeight: 600,
                  }}>
                    {d.aiExposure}%
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Overpass Mono', monospace", fontSize: 14,
                  fontWeight: 700, textAlign: "right",
                  color: d.pctChange > 10 ? T.growth : d.pctChange < -10 ? T.accent : "rgba(255,255,255,0.45)",
                }}>
                  {d.pctChange > 0 ? "+" : ""}{d.pctChange}%
                </div>
              </div>
            ))}
          </div>

          {/* The punchline */}
          <div style={{
            marginTop: 36, padding: "20px 24px",
            borderLeft: `3px solid ${T.accent}`,
            background: "rgba(232,84,62,0.06)",
            borderRadius: "0 6px 6px 0",
          }}>
            <p style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.4,
              color: "#fff", margin: 0, fontStyle: "italic",
            }}>
              78% AI exposure. +134% enrollment growth. Students are flooding into
              the discipline most likely to be transformed by the technology it creates.
            </p>
          </div>

          <Mono color="rgba(255,255,255,0.25)" size={10} style={{ display: "block", marginTop: 20, lineHeight: 1.6 }}>
            AI exposure synthesized from Goldman Sachs task-level analysis, Microsoft/OpenAI
            occupational exposure research, WEF 2025 skills obsolescence data, and Brookings
            Institution analysis. Field-level exposure is approximate and conveys relative, not absolute, risk.
          </Mono>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PART II: COMPETING FUTURES (forecasts + divergence unified)
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="fut" style={{ ...wrap, padding: "56px 28px 56px", ...anim("fut") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part II: The Forecasts
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px", maxWidth: 700,
        }}>
          Three institutions, three timelines, zero agreement
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 600, margin: "0 0 28px",
        }}>
          The gap between these forecasts is not a margin of error. It reflects
          fundamentally different assumptions about how fast organizations adopt AI,
          how capable AI becomes, and whether historical patterns still apply.
        </p>

        {/* Scenario cards */}
        <div style={{ display: "flex", gap: 10, margin: "0 0 16px", flexWrap: "wrap" }}>
          {Object.entries(forecasts).map(([key, s]) => {
            const on = activeScenario === key;
            return (
              <button key={key} onClick={() => setActiveScenario(key)} style={{
                flex: 1, minWidth: 200,
                background: on ? s.color : T.surface,
                color: on ? "#fff" : T.ink,
                border: `2px solid ${on ? s.color : T.border}`,
                borderRadius: 8, padding: "18px 16px", cursor: "pointer",
                textAlign: "left", transition: "all 0.25s ease",
                position: "relative",
              }}>
                {on && <div style={{
                  position: "absolute", top: -2, left: 20, width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderBottom: "6px solid " + s.color, transform: "rotate(180deg)",
                }} />}
                <Mono bold size={10} color={on ? "rgba(255,255,255,0.7)" : T.inkLight}
                  style={{ textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                  {key}
                </Mono>
                <div style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.2, marginBottom: 6,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 13,
                  opacity: on ? 0.9 : 0.5, lineHeight: 1.35,
                }}>{s.headline}</div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "24px 20px", marginBottom: 32,
        }}>
          <div style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.inkMuted,
            lineHeight: 1.6, padding: "10px 14px", background: T.surfaceAlt,
            borderRadius: 5, borderLeft: `3px solid ${scenario.color}`,
            marginBottom: 20,
          }}>
            <strong style={{ color: T.ink }}>Methodology:</strong> {scenario.methodology}
          </div>

          {activeScenario === "conservative" && (
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, marginBottom: 14 }}>
                Even among their most AI-exposed occupations, BLS projects growth
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
                {scenario.occupations.map((o, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 12px", background: T.surfaceAlt, borderRadius: 5,
                  }}>
                    <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>{o.name}</span>
                    <Mono bold size={13} color={o.g > 0 ? T.growth : T.decline}>
                      {o.g > 0 ? "+" : ""}{o.g}%
                    </Mono>
                  </div>
                ))}
              </div>
              <Mono color={T.inkLight} size={10} style={{ display: "block", marginTop: 12, lineHeight: 1.6 }}>
                BLS Employment Projections 2023-2033. Only 2 of 8 high-AI-exposure occupations show decline.
              </Mono>
            </div>
          )}

          {activeScenario === "moderate" && (
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, marginBottom: 14 }}>
                92 million jobs displaced, 170 million created. A net gain nobody will feel evenly.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {scenario.stats.map((s, i) => (
                  <div key={i} style={{ padding: "14px 12px", background: T.surfaceAlt, borderRadius: 6 }}>
                    <div style={{
                      fontFamily: "'Overpass Mono', monospace", fontSize: 26,
                      fontWeight: 700, color: T.caution, lineHeight: 1.1,
                    }}>{s.v}</div>
                    <div style={{
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 13,
                      color: T.inkMuted, marginTop: 4, lineHeight: 1.3,
                    }}>{s.l}</div>
                    <Mono color={T.inkLight} size={9} style={{ display: "block", marginTop: 6 }}>{s.s}</Mono>
                  </div>
                ))}
              </div>
              <Mono color={T.inkLight} size={10} style={{ display: "block", marginTop: 12, lineHeight: 1.6 }}>
                Goldman's 2025 update: only 2.5% of US jobs at current displacement risk, but tech
                unemployment for ages 20-30 already up ~3 percentage points.
              </Mono>
            </div>
          )}

          {activeScenario === "aggressive" && (
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, marginBottom: 6 }}>
                Not fringe. The stated expectation of the people building these systems.
              </div>
              <p style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                lineHeight: 1.6, color: T.inkMuted, maxWidth: 560, margin: "0 0 14px",
              }}>
                Anthropic, OpenAI, Google DeepMind, and Meta AI leadership all project AI
                will reach or exceed human-level performance on most cognitive tasks within
                years, based on observed capability scaling. Their timeline is not decades.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {scenario.caps.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 14px", background: T.surfaceAlt, borderRadius: 5,
                  }}>
                    <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, flex: 1 }}>{c.t}</span>
                    <Mono bold size={11} color={T.accent} style={{ minWidth: 130, textAlign: "right" }}>{c.s}</Mono>
                    <Mono size={11} color={T.inkLight} style={{ minWidth: 32 }}>{c.y}</Mono>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DIVERGENCE CHART (inside Part II as the visual punchline) ── */}
        <h3 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400,
          lineHeight: 1.2, margin: "0 0 8px",
        }}>
          The disagreement, on one axis
        </h3>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, lineHeight: 1.6,
          color: T.inkMuted, maxWidth: 560, margin: "0 0 20px",
        }}>
          Estimated percent of knowledge-worker roles facing significant task
          displacement under each framework. This chart is illustrative: its purpose
          is to make the <em style={{ color: T.ink }}>scale of disagreement</em> legible,
          not to predict a specific outcome.
        </p>

        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "20px 12px 12px",
        }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={divergence} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={T.borderLight} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 11, fill: T.inkLight }}
                axisLine={{ stroke: T.border }} tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 11, fill: T.inkLight }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} width={40} domain={[-45, 5]}
              />
              <Tooltip content={<DivTip />} />
              <ReferenceLine y={0} stroke={T.ink} strokeWidth={1} />
              <Line type="monotone" dataKey="bls" name="BLS" stroke={T.conservative}
                strokeWidth={2.5} dot={{ r: 3, fill: T.conservative }} />
              <Line type="monotone" dataKey="mod" name="Goldman / McKinsey"
                stroke={T.moderate} strokeWidth={2.5} dot={{ r: 3, fill: T.moderate }} />
              <Line type="monotone" dataKey="agg" name="Frontier AI Labs"
                stroke={T.aggressive} strokeWidth={2.5} dot={{ r: 3, fill: T.aggressive }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, padding: "8px 8px 0", flexWrap: "wrap" }}>
            {[
              { c: T.conservative, l: "BLS", sub: "Peak: -1.4%" },
              { c: T.moderate, l: "Goldman / McKinsey", sub: "Peak: -15%" },
              { c: T.aggressive, l: "Frontier AI", sub: "Peak: -38%" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 3, background: item.c, borderRadius: 1 }} />
                <Mono size={11} color={T.inkMuted}>{item.l}</Mono>
                <Mono size={10} color={T.inkLight}>{item.sub}</Mono>
              </div>
            ))}
          </div>
          <Mono color={T.inkLight} size={10} style={{ display: "block", padding: "8px 8px 0", lineHeight: 1.6, maxWidth: 480 }}>
            Illustrative. BLS from published projections. Moderate synthesized from
            Goldman/McKinsey/WEF. Aggressive from AI lab leadership timelines.
          </Mono>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PART III: THE TAKEAWAY (tight, two beats)
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="end" style={{
        background: T.surfaceAlt, borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`, padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("end") }}>
          <Mono bold color={T.growth} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Part III: The Takeaway
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 24px", maxWidth: 680,
          }}>
            The most rational response might also be the most vulnerable one
          </h2>

          <div style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, lineHeight: 1.75,
            color: T.inkMuted, maxWidth: 620,
          }}>
            <p style={{ margin: "0 0 20px" }}>
              The data tells a story about hedging. 119,000 graduates chose computer
              science in 2024, making the most rational bet available: if AI reshapes
              everything, the people closest to it should have the best chance of adapting.
              But that bet carries a paradox. At 78% task exposure, no field is more
              directly in AI's path. These graduates are not insulated from disruption.
              They are at the center of it.
            </p>
            <p style={{ margin: 0, color: T.ink }}>
              Across every forecast -- from the BLS's gentle -1.4% to the frontier
              labs' -38% peak disruption -- one finding is consistent: the dividing line
              between who thrives and who is displaced is the capacity to learn faster
              than the tools improve. That is no longer a soft skill. It is the primary one.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ METHODOLOGY FOOTER ═══ */}
      <footer style={{ padding: "40px 0 56px" }}>
        <div style={wrap}>
          <Mono bold color={T.inkMuted} size={11} style={{ display: "block", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Methodology & Sources
          </Mono>
          <div style={{
            fontFamily: "'Overpass Mono', monospace", fontSize: 11, color: T.inkLight,
            lineHeight: 1.8, maxWidth: 660,
          }}>
            <strong style={{ color: T.inkMuted }}>Degree data:</strong> NCES IPEDS
            Completions via Digest of Education Statistics Table 322.10 (2012-2022, final).
            2022-23 from National Student Clearinghouse Spring 2024 Undergraduate Degree
            Earners report. 2023-24 estimated from IPEDS Fall 2024 provisional release and
            CRA Taulbee Survey enrollment trends. Estimated values noted throughout.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>AI exposure:</strong> Synthesized from
            Goldman Sachs task-level automation analysis (2023), Microsoft/OpenAI occupational
            exposure research, WEF Future of Jobs 2025 skills obsolescence data, and Brookings
            Institution AI exposure analysis. Field-level figures are approximate and convey
            relative, not absolute, risk.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Forecasts:</strong> BLS Employment
            Projections 2023-2033. Goldman Sachs "Generative AI and the Future of Work"
            (2023, updated Aug 2025). McKinsey Global Institute (2023). WEF Future of Jobs
            2025. Frontier scenario from public statements by Anthropic CEO Dario Amodei and
            Stanford HAI AI Index Report 2025.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Divergence chart:</strong> Illustrative,
            not predictive. Represents estimated proportion of knowledge-worker roles facing
            significant task disruption under each framework's assumptions.
            <br/><br/>
            Built by Alison &middot; 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
