"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
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
  loneliness: "#8B5E9B",
};

// ─── BEFORE/AFTER INTERACTION DATA ───────────────────────────────
const interactionPairs = [
  { task: "Buy groceries", then: "Chat with cashier", now: "Self-checkout (66% prefer it)" },
  { task: "Deposit a check", then: "Visit the bank teller", now: "Photo in an app" },
  { task: "Get directions", then: "Ask a stranger", now: "GPS on your phone" },
  { task: "Order food", then: "Call and talk to someone", now: "Tap an app, no words spoken" },
  { task: "Resolve a billing issue", then: "Phone call with a person", now: "Chatbot \u2192 chatbot \u2192 chatbot" },
  { task: "Meet a partner", then: "Through friends, church, neighborhood", now: "Swipe right on an app" },
];

// ─── DIVERGING LINES CHART DATA ─────────────────────────────────
const divergingData = [
  { year: 2005, smartphones: 10, friendTime: 6.5, loneliness: 20 },
  { year: 2006, smartphones: 13, friendTime: 6.3, loneliness: 20 },
  { year: 2007, smartphones: 16, friendTime: 6.2, loneliness: 21 },
  { year: 2008, smartphones: 20, friendTime: 6.0, loneliness: 21 },
  { year: 2009, smartphones: 24, friendTime: 5.8, loneliness: 22 },
  { year: 2010, smartphones: 28, friendTime: 5.6, loneliness: 22 },
  { year: 2011, smartphones: 35, friendTime: 5.5, loneliness: 23 },
  { year: 2012, smartphones: 44, friendTime: 5.3, loneliness: 23 },
  { year: 2013, smartphones: 56, friendTime: 5.1, loneliness: 24 },
  { year: 2014, smartphones: 64, friendTime: 5.0, loneliness: 25 },
  { year: 2015, smartphones: 72, friendTime: 4.7, loneliness: 25 },
  { year: 2016, smartphones: 77, friendTime: 4.5, loneliness: 26 },
  { year: 2017, smartphones: 80, friendTime: 4.3, loneliness: 27 },
  { year: 2018, smartphones: 83, friendTime: 4.2, loneliness: 28 },
  { year: 2019, smartphones: 85, friendTime: 4.0, loneliness: 30 },
  { year: 2020, smartphones: 87, friendTime: 3.5, loneliness: 31 },
  { year: 2021, smartphones: 88, friendTime: 3.3, loneliness: 32 },
  { year: 2022, smartphones: 89, friendTime: 3.0, loneliness: 32 },
  { year: 2023, smartphones: 90, friendTime: 3.1, loneliness: 33 },
  { year: 2024, smartphones: 90, friendTime: 3.0, loneliness: 33 },
];

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────
const Mono = ({ children, color = T.inkLight, size = 10, bold = false, style = {} }) => (
  <span style={{
    fontFamily: "'Overpass Mono', monospace", fontSize: size,
    fontWeight: bold ? 700 : 400, color, letterSpacing: "0.04em", ...style,
  }}>{children}</span>
);

// ─── COUNT-UP HOOK ───────────────────────────────────────────────
function useCountUp(target, duration = 1200, active = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration]);
  return active ? value : 0;
}

// ─── CUSTOM CHART TOOLTIP ────────────────────────────────────────
const DivergingTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: T.ink, color: "#fff", padding: "10px 14px", borderRadius: 4,
      fontFamily: "'Overpass Mono', monospace", fontSize: 11,
    }}>
      <div style={{ marginBottom: 6, fontWeight: 700 }}>{d.year}</div>
      <div style={{ color: T.cool, marginBottom: 3 }}>
        Smartphone ownership: {d.smartphones}%
      </div>
      <div style={{ color: T.growth, marginBottom: 3 }}>
        Weekly friend time: {d.friendTime} hrs
      </div>
      <div style={{ color: T.loneliness }}>
        Loneliness: {d.loneliness}%
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────
export default function LoneliestNetworkDashboard() {
  const [vis, setVis] = useState(new Set(["hero"]));
  const [strikeVisible, setStrikeVisible] = useState(false);
  const [lineToggles, setLineToggles] = useState({
    smartphones: true,
    friendTime: true,
    loneliness: true,
  });

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Intersection observers for scroll animations
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

  // Strike-through animation trigger
  useEffect(() => {
    if (vis.has("hero-table")) {
      const timer = setTimeout(() => setStrikeVisible(true), prefersReducedMotion ? 0 : 400);
      return () => clearTimeout(timer);
    }
  }, [vis, prefersReducedMotion]);

  // Count-up hooks
  const thirdPlaceActive = vis.has("third-place");
  const thirdPlaceCount = useCountUp(37, prefersReducedMotion ? 0 : 1200, thirdPlaceActive);

  const costActive = vis.has("cost");
  const costCount = useCountUp(61, prefersReducedMotion ? 0 : 1200, costActive);

  const anim = (id) => prefersReducedMotion ? {} : ({
    opacity: vis.has(id) ? 1 : 0,
    transform: vis.has(id) ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });

  const wrap = { maxWidth: 1060, margin: "0 auto", padding: "0 28px" };

  const toggleLine = (key) => {
    setLineToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Overpass+Mono:wght@400;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* ═══ MASTHEAD ═══ */}
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mono bold color={T.inkLight} size={10} style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Data Investigation
          </Mono>
          <Mono color={T.inkLight} size={10}>Alison &middot; Feb 2026</Mono>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO — "The Optimization"
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ ...wrap, padding: "64px 28px 20px" }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(38px, 5.5vw, 62px)", fontWeight: 400,
          lineHeight: 1.06, margin: "0 0 20px", maxWidth: 780,
        }}>
          The Loneliest Network
        </h1>
        <p style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.45,
          color: T.inkMuted, maxWidth: 640, margin: "0 0 40px", fontStyle: "italic",
        }}>
          We&rsquo;ve never had more ways to connect. We&rsquo;ve never been more alone.
        </p>

        {/* ── Before/After Table ── */}
        <div data-a="hero-table" style={{
          display: "flex", flexDirection: "column", gap: 8,
          marginBottom: 40, ...anim("hero-table"),
        }}>
          {interactionPairs.map((pair, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "160px 1fr 1fr",
              gap: 12, alignItems: "center",
              padding: "12px 16px", background: T.surface,
              border: `1px solid ${T.borderLight}`, borderRadius: 6,
            }}>
              <Mono bold size={10} color={T.inkMuted} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {pair.task}
              </Mono>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: T.inkMuted, lineHeight: 1.4,
                textDecoration: strikeVisible ? "line-through" : "none",
                textDecorationColor: T.inkLight,
                transition: prefersReducedMotion ? "none" : "text-decoration-color 0.4s ease",
              }}>
                {pair.then}
              </div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: T.accent, fontWeight: 500, lineHeight: 1.4,
              }}>
                {pair.now}
              </div>
            </div>
          ))}
          <div style={{
            display: "grid", gridTemplateColumns: "160px 1fr 1fr",
            gap: 12, padding: "0 16px",
          }}>
            <div />
            <Mono size={9} color={T.inkLight} style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Then</Mono>
            <Mono size={9} color={T.accent} style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Now</Mono>
          </div>
        </div>

        {/* Transition quote */}
        <div style={{
          borderLeft: `3px solid ${T.accent}`, padding: "16px 20px",
          margin: "0 0 56px", maxWidth: 620,
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 20, lineHeight: 1.45,
            color: T.ink, margin: 0, fontStyle: "italic",
          }}>
            Every one of these improvements is real. But each one also removed a moment
            where two people had to interact.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: "The Vanishing Third Place" (Dark section)
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="third-place" style={{
        background: T.surfaceDark, color: "#fff", padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("third-place") }}>
          <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Part I: The Infrastructure
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 28px", maxWidth: 680, color: "#fff",
          }}>
            The Vanishing Third Place
          </h2>

          {/* Hero stat */}
          <div style={{
            display: "flex", alignItems: "baseline", gap: 16,
            marginBottom: 8, flexWrap: "wrap",
          }}>
            <span
              aria-label="37 percent"
              style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 72, fontWeight: 700,
                color: T.accent, lineHeight: 1,
              }}
            >
              {thirdPlaceCount}%
            </span>
            <span style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 20,
              color: "#fff", fontWeight: 500, maxWidth: 400,
            }}>
              drop in time spent with friends, 2014&ndash;2019 &mdash; before the pandemic
            </span>
          </div>
          <Mono size={9} color="rgba(255,255,255,0.4)" style={{ display: "block", marginBottom: 36, lineHeight: 1.6 }}>
            American Time Use Survey, Bureau of Labor Statistics
          </Mono>

          {/* Three stat cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12, marginBottom: 32,
          }}>
            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 32, fontWeight: 700,
                color: T.accent, lineHeight: 1, marginBottom: 8,
              }}>68%</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: "rgba(255,255,255,0.85)", marginBottom: 8,
              }}>decline in bowling centers from peak</div>
              <Mono size={9} color="rgba(255,255,255,0.4)" style={{ lineHeight: 1.5 }}>
                ~12,000 &rarr; ~3,800 &middot; IBISWorld
              </Mono>
            </div>

            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                color: T.caution, lineHeight: 1, marginBottom: 8,
              }}>Below 50%</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: "rgba(255,255,255,0.85)", marginBottom: 8,
              }}>US church membership, first time in 80 years</div>
              <Mono size={9} color="rgba(255,255,255,0.4)" style={{ lineHeight: 1.5 }}>
                Gallup, 2021
              </Mono>
            </div>

            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                color: T.cool, lineHeight: 1, marginBottom: 8,
              }}>55% &rarr; 27%</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: "rgba(255,255,255,0.85)", marginBottom: 8,
              }}>men with 6+ close friends, 1990 vs today</div>
              <Mono size={9} color="rgba(255,255,255,0.4)" style={{ lineHeight: 1.5 }}>
                Men with zero close friends: 3% &rarr; 15% &middot; Survey Center on American Life, 2021
              </Mono>
            </div>
          </div>

          {/* Observation callout */}
          <div style={{
            padding: "20px 24px",
            borderLeft: `3px solid ${T.accent}`,
            background: "rgba(232,84,62,0.06)",
            borderRadius: "0 6px 6px 0",
            marginBottom: 28,
          }}>
            <p style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.45,
              color: "#fff", margin: 0, fontStyle: "italic",
            }}>
              Third places &mdash; the bowling alleys, diners, churches, and barbershops where people
              used to encounter each other without planning to &mdash; are disappearing faster than
              we&rsquo;re replacing them.
            </p>
          </div>

          {/* Small supporting stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}>
            <div style={{
              padding: "14px 16px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: 6,
              }}>
                Face-to-face interaction down <strong>30%</strong> from 2003&ndash;2022. For teenagers, nearly <strong>45%</strong>.
              </div>
              <Mono size={9} color="rgba(255,255,255,0.4)">
                American Time Use Survey, BLS
              </Mono>
            </div>
            <div style={{
              padding: "14px 16px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: 6,
              }}>
                Time with non-household family: <strong>35 min/day</strong> (2003) &rarr; <strong>22 min/day</strong> (2020).
              </div>
              <Mono size={9} color="rgba(255,255,255,0.4)">
                American Time Use Survey, BLS
              </Mono>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: "The Diverging Lines" (Main chart)
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="diverging" style={{ ...wrap, padding: "56px 28px", ...anim("diverging") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part II: The Paradox
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px", maxWidth: 700,
        }}>
          The Diverging Lines
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 620, margin: "0 0 28px",
        }}>
          Connection tools went up. Actual connection went down. These three trend lines
          tell the story of a paradox that defined the last two decades.
        </p>

        {/* Toggle buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "smartphones", label: "\uD83D\uDCF1 Smartphone Ownership", color: T.cool },
            { key: "friendTime", label: "\uD83D\uDC65 In-Person Friend Time", color: T.growth },
            { key: "loneliness", label: "\uD83D\uDE14 Loneliness Prevalence", color: T.loneliness },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              aria-label={`Toggle ${label}`}
              aria-pressed={lineToggles[key]}
              style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 10,
                letterSpacing: "0.04em",
                padding: "8px 14px", borderRadius: 4,
                border: `1px solid ${lineToggles[key] ? color : T.border}`,
                background: lineToggles[key] ? `${color}10` : T.surface,
                color: lineToggles[key] ? color : T.inkLight,
                cursor: "pointer",
                fontWeight: lineToggles[key] ? 700 : 400,
                transition: prefersReducedMotion ? "none" : "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "24px 16px 16px",
        }}>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={divergingData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis
                dataKey="year"
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 10, fill: T.inkLight }}
                tickLine={{ stroke: T.border }}
                axisLine={{ stroke: T.border }}
              />
              <YAxis
                tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 10, fill: T.inkLight }}
                tickLine={{ stroke: T.border }}
                axisLine={{ stroke: T.border }}
                domain={[0, 100]}
                label={{
                  value: "% / hours",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontFamily: "'Overpass Mono', monospace", fontSize: 9, fill: T.inkLight },
                }}
              />
              <Tooltip content={<DivergingTooltip />} />
              <ReferenceLine
                x={2014}
                stroke={T.inkLight}
                strokeDasharray="4 4"
                label={{
                  value: "Smartphone majority",
                  position: "top",
                  style: { fontFamily: "'Overpass Mono', monospace", fontSize: 9, fill: T.inkLight },
                }}
              />
              {lineToggles.smartphones && (
                <Line
                  type="monotone"
                  dataKey="smartphones"
                  stroke={T.cool}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: T.cool }}
                  name="Smartphone Ownership (%)"
                />
              )}
              {lineToggles.friendTime && (
                <Line
                  type="monotone"
                  dataKey="friendTime"
                  stroke={T.growth}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: T.growth }}
                  name="Weekly Friend Time (hrs)"
                  yAxisId={0}
                />
              )}
              {lineToggles.loneliness && (
                <Line
                  type="monotone"
                  dataKey="loneliness"
                  stroke={T.loneliness}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: T.loneliness }}
                  name="Loneliness (%)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart annotation */}
        <div style={{ marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.6 }}>
            Smartphone data: Pew Research Center &middot; Friend time: ATUS, BLS &middot; Loneliness: Cigna / Harvard / APA surveys
          </Mono>
        </div>
        <div style={{
          marginTop: 8, padding: "10px 14px", background: T.surfaceAlt, borderRadius: 6,
        }}>
          <Mono size={9} color={T.inkMuted} style={{ lineHeight: 1.6 }}>
            Note: Friend time is plotted on the same 0&ndash;100 axis as percentages for visual comparison.
            Actual values are hours per week (shown in tooltip). The vertical reference line marks 2014,
            when U.S. smartphone ownership crossed 50% &mdash; and in-person friend time began its steepest decline.
          </Mono>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: "The Loneliest Generation"
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="cost" style={{ ...wrap, padding: "56px 28px", ...anim("cost") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part III: The Cost
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 28px", maxWidth: 700,
        }}>
          The Loneliest Generation
        </h2>

        {/* Hero stat */}
        <div style={{
          display: "flex", alignItems: "baseline", gap: 16,
          marginBottom: 8, flexWrap: "wrap",
        }}>
          <span
            aria-label="61 percent"
            style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 72, fontWeight: 700,
              color: T.accent, lineHeight: 1,
            }}
          >
            {costCount}%
          </span>
          <span style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 20,
            color: T.ink, fontWeight: 500, maxWidth: 400,
          }}>
            of young adults (18&ndash;25) report serious loneliness
          </span>
        </div>
        <Mono size={9} color={T.inkLight} style={{ display: "block", marginBottom: 36, lineHeight: 1.6 }}>
          Harvard Making Caring Common, 2021
        </Mono>

        {/* Two-column layout */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}>
          {/* Left: The Numbers */}
          <div>
            <Mono size={10} color={T.inkMuted} bold style={{
              display: "block", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em",
            }}>The Numbers</Mono>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "18px 16px",
              }}>
                <div style={{
                  fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                  color: T.decline, lineHeight: 1, marginBottom: 8,
                }}>1 in 3</div>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: T.ink, marginBottom: 8, lineHeight: 1.5,
                }}>US adults feel lonely at least weekly</div>
                <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                  APA, 2024
                </Mono>
              </div>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "18px 16px",
              }}>
                <div style={{
                  fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                  color: T.loneliness, lineHeight: 1, marginBottom: 8,
                }}>1 billion+</div>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: T.ink, marginBottom: 8, lineHeight: 1.5,
                }}>people worldwide report loneliness (24% of global population)</div>
                <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                  Meta-Gallup, 142 countries, 2023
                </Mono>
              </div>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "18px 16px",
              }}>
                <div style={{
                  fontFamily: "'Overpass Mono', monospace", fontSize: 24, fontWeight: 700,
                  color: T.caution, lineHeight: 1, marginBottom: 8,
                }}>25% vs 16%</div>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: T.ink, marginBottom: 8, lineHeight: 1.5,
                }}>fully remote workers report loneliness vs on-site workers</div>
                <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                  Household Pulse Survey, 2024
                </Mono>
              </div>
            </div>
          </div>

          {/* Right: The Health Impact */}
          <div>
            <Mono size={10} color={T.inkMuted} bold style={{
              display: "block", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em",
            }}>The Health Impact</Mono>

            <div style={{
              padding: "24px 20px",
              borderLeft: `3px solid ${T.accent}`,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              borderLeftColor: T.accent,
              borderLeftWidth: 3,
            }}>
              <p style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.5,
                color: T.ink, margin: "0 0 12px", fontStyle: "italic",
              }}>
                &ldquo;Lacking social connection carries mortality risk comparable to smoking
                up to 15 cigarettes per day.&rdquo;
              </p>
              <Mono size={9} color={T.inkLight} style={{ display: "block", marginBottom: 20, lineHeight: 1.6 }}>
                Holt-Lunstad et al., 2010 &middot; Endorsed by U.S. Surgeon General, 2023
              </Mono>

              <div style={{
                padding: "14px 16px", background: T.surfaceAlt,
                borderRadius: 6, marginTop: 12,
              }}>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: T.ink, lineHeight: 1.55, marginBottom: 8,
                }}>
                  Global social isolation prevalence rose <strong>13.4%</strong> over 16 years,
                  with the <em>entire</em> increase occurring after 2019.
                </div>
                <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                  JAMA Network Open, 2025
                </Mono>
              </div>
            </div>
          </div>
        </div>

        {/* Transition */}
        <div style={{
          borderLeft: `3px solid ${T.accent}`, padding: "16px 20px",
          margin: "36px 0 0", maxWidth: 620,
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.45,
            color: T.ink, margin: 0, fontStyle: "italic",
          }}>
            We didn&rsquo;t stop needing connection. We just changed the medium.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: "The Redirect"
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="redirect" style={{
        background: T.surfaceDark, color: "#fff", padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("redirect") }}>
          <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Part IV: The Redirect
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 28px", maxWidth: 680, color: "#fff",
          }}>
            Where Did Connection Go?
          </h2>

          {/* Three evidence cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12, marginBottom: 32,
          }}>
            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <Mono bold size={10} color={T.accent} style={{ display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Parasocial Relationships
              </Mono>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: 10,
              }}>
                <strong style={{ color: "#fff" }}>51%</strong> of Americans have likely been in a
                parasocial relationship. Academic publications on the topic between 2016&ndash;2020
                exceeded the prior 60 years combined.
              </div>
              <Mono size={9} color="rgba(255,255,255,0.4)">
                Thriveworks
              </Mono>
            </div>

            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <Mono bold size={10} color={T.accent} style={{ display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Meeting Partners
              </Mono>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: 10,
              }}>
                Meeting online surpassed meeting through friends for the first time in <strong style={{ color: "#fff" }}>2013</strong>.
                Meeting through family, church, and neighborhood have all been in steady decline since 1940.
              </div>
              <Mono size={9} color="rgba(255,255,255,0.4)">
                Stanford &ldquo;How Couples Meet&rdquo; study
              </Mono>
            </div>

            <div style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            }}>
              <Mono bold size={10} color={T.accent} style={{ display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Texting vs. Talking
              </Mono>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: 10,
              }}>
                Americans text at <strong style={{ color: "#fff" }}>5x</strong> the rate of phone calls (~32 texts/day vs ~6 calls).
                90% of Gen Z check texts within 5 minutes &mdash; yet Gen Z reports the highest loneliness of any generation.
              </div>
              <Mono size={9} color="rgba(255,255,255,0.4)">
                SimpleTexting / Cigna U.S. Loneliness Index
              </Mono>
            </div>
          </div>

          {/* Observation */}
          <div style={{
            padding: "20px 24px",
            borderLeft: `3px solid ${T.accent}`,
            background: "rgba(232,84,62,0.06)",
            borderRadius: "0 6px 6px 0",
          }}>
            <p style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.45,
              color: "#fff", margin: 0, fontStyle: "italic",
            }}>
              The friction of in-person interaction &mdash; the awkwardness, the vulnerability, the effort
              of showing up &mdash; wasn&rsquo;t a bug. It was the mechanism through which connection actually formed.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: Closing
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="close" style={{ ...wrap, padding: "56px 28px", ...anim("close") }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 24px", maxWidth: 680,
        }}>
          The design challenge
        </h2>

        <div style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, lineHeight: 1.75,
          color: T.inkMuted, maxWidth: 620,
        }}>
          <p style={{ margin: "0 0 20px" }}>
            Some connections require friction. The effort of showing up, the discomfort of
            small talk, the inconvenience of being somewhere at a specific time &mdash; these
            weren&rsquo;t obstacles to connection. They <em>were</em> connection.
          </p>
          <p style={{ margin: 0, color: T.ink }}>
            The best-designed systems of the next decade won&rsquo;t just connect people faster.
            They&rsquo;ll create reasons for people to be in the same room.
          </p>
        </div>

        {/* Final punchline */}
        <div style={{
          borderLeft: `3px solid ${T.accent}`, padding: "20px 24px",
          margin: "36px 0 0", maxWidth: 620,
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.4,
            color: T.ink, margin: 0, fontStyle: "italic",
          }}>
            We optimized for connection and got networks. The next challenge is
            optimizing for presence.
          </p>
        </div>
      </section>

      {/* ═══ METHODOLOGY FOOTER ═══ */}
      <footer style={{ padding: "40px 0 56px", borderTop: `1px solid ${T.border}` }}>
        <div style={wrap}>
          <Mono bold color={T.inkMuted} size={11} style={{ display: "block", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Methodology &amp; Sources
          </Mono>
          <div style={{
            fontFamily: "'Overpass Mono', monospace", fontSize: 11, color: T.inkLight,
            lineHeight: 1.8, maxWidth: 660,
          }}>
            <strong style={{ color: T.inkMuted }}>Time with friends:</strong> American Time Use Survey,
            Bureau of Labor Statistics. 37% decline measured 2014&ndash;2019 (pre-pandemic).
            Face-to-face interaction down 30% from 2003&ndash;2022; for teenagers, nearly 45%.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Third places:</strong> Bowling center decline:
            IBISWorld industry data, peak ~12,000 to ~3,800.
            Church membership: Gallup, 2021 (first time below 50% in 80 years of tracking).
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Men&rsquo;s friendships:</strong> Survey Center on
            American Life, 2021. Men with 6+ close friends: 55% (1990) &rarr; 27% (2021).
            Men with zero close friends: 3% &rarr; 15%.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Smartphone ownership:</strong> Pew Research Center,
            annual surveys 2005&ndash;2024.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Loneliness prevalence:</strong> Cigna U.S. Loneliness
            Index (2018, 2020); Harvard Making Caring Common (2021, N=950 young adults);
            APA (2024). Gen Z loneliest generation: Cigna.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Global loneliness:</strong> Meta-Gallup State of
            Social Connections Report, 2023. 142 countries. 24% of global population.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Remote work loneliness:</strong> U.S. Census Bureau
            Household Pulse Survey, 2024. 25% fully remote vs 16% on-site.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Health impact:</strong> Holt-Lunstad, Smith &amp;
            Layton, &ldquo;Social Relationships and Mortality Risk,&rdquo; PLoS Medicine, 2010.
            &ldquo;Lacking social connection&rdquo; (broader construct, not loneliness alone)
            carries mortality risk comparable to smoking up to 15 cigarettes/day.
            Endorsed by U.S. Surgeon General advisory, 2023.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Social isolation trend:</strong> JAMA Network Open,
            2025. Global social isolation prevalence rose 13.4% over 16 years;
            entire increase concentrated after 2019.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Parasocial relationships:</strong> Thriveworks, 2021.
            51% of Americans have likely been in a parasocial relationship.
            Academic publication volume: 2016&ndash;2020 exceeded the prior 60 years combined.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Meeting partners:</strong> Stanford &ldquo;How Couples
            Meet and Stay Together&rdquo; study. Online surpassed friends as meeting venue in 2013.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Texting patterns:</strong> SimpleTexting survey data.
            ~32 texts/day vs ~6 phone calls. 90% of Gen Z check texts within 5 minutes.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Data limitations:</strong> Loneliness trend data is
            compiled from multiple survey instruments with differing methodologies;
            precise year-over-year comparisons should be treated as directional, not exact.
            Friend time values are approximate based on published ATUS aggregations.
            <br/><br/>
            Built by Alison &middot; Feb 2026
          </div>
        </div>
      </footer>

      {/* ── Mobile responsive overrides ── */}
      <style>{`
        @media (max-width: 640px) {
          [data-a="hero-table"] > div {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
          [data-a="third-place"] > div > div:nth-child(5),
          [data-a="cost"] > div:nth-child(5),
          [data-a="redirect"] > div > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
