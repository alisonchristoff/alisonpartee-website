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
  loneliness: "#C4A0D4",
};

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
const DivergingTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: T.ink, color: "#fff", padding: "12px 16px", borderRadius: 4,
      fontFamily: "'Overpass Mono', monospace", fontSize: 11,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}>
      <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13 }}>{d.year}</div>
      <div style={{ color: T.cool, marginBottom: 4 }}>
        Smartphone ownership: {d.smartphones}%
      </div>
      <div style={{ color: T.growth, marginBottom: 4 }}>
        Weekly friend time: {d.friendTime} hrs
      </div>
      <div style={{ color: T.loneliness }}>
        Report loneliness: {d.loneliness}%
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────
export default function LoneliestNetworkDashboard() {
  const [vis, setVis] = useState(new Set(["hero"]));
  const [lineToggles, setLineToggles] = useState({
    smartphones: true,
    friendTime: true,
    loneliness: true,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const obs = [];
    document.querySelectorAll("[data-a]").forEach(el => {
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setVis(p => new Set([...p, el.dataset.a])); },
        { threshold: 0.15 }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  // Count-up hooks
  const friendDropActive = vis.has("vanishing");
  const friendDropCount = useCountUp(37, prefersReducedMotion ? 0 : 1400, friendDropActive);

  const lonelyGenActive = vis.has("generation");
  const lonelyGenCount = useCountUp(61, prefersReducedMotion ? 0 : 1400, lonelyGenActive);

  const billionActive = vis.has("billion");
  const billionCount = useCountUp(1, prefersReducedMotion ? 0 : 800, billionActive);

  const anim = (id) => prefersReducedMotion ? {} : ({
    opacity: vis.has(id) ? 1 : 0,
    transform: vis.has(id) ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  });

  const wrap = { maxWidth: 1060, margin: "0 auto", padding: "0 28px" };
  const wideWrap = { maxWidth: 1200, margin: "0 auto", padding: "0 28px" };

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
          HERO — Title, subtitle, then IMMEDIATELY the chart.
          The data IS the opening. No preamble.
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ ...wideWrap, padding: "64px 28px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(44px, 6.5vw, 76px)", fontWeight: 400,
            lineHeight: 1.04, margin: "0 0 20px",
          }}>
            The Loneliest Network
          </h1>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: "clamp(18px, 2.5vw, 24px)",
            lineHeight: 1.5, color: T.inkMuted, maxWidth: 520, margin: "0 auto",
            fontStyle: "italic",
          }}>
            We&rsquo;ve never had more ways to connect.<br/>
            We&rsquo;ve never been more alone.
          </p>
        </div>

        {/* ── THE CHART — the hook ── */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 400, lineHeight: 1.25,
            margin: "0 0 12px", textAlign: "center",
          }}>
            Three measures. Twenty years. Watch what happens at the dashed line.
          </h2>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, lineHeight: 1.65,
            color: T.inkMuted, textAlign: "center", maxWidth: 540, margin: "0 auto 24px",
          }}>
            <span style={{ color: T.cool, fontWeight: 600 }}>Blue</span> is smartphone adoption.{" "}
            <span style={{ color: T.growth, fontWeight: 600 }}>Green</span> is hours per week spent with friends in person.{" "}
            <span style={{ color: T.loneliness, fontWeight: 600 }}>Purple</span> is the percentage of people reporting loneliness.
            The dashed line marks 2014 &mdash; when smartphones crossed 50% ownership.
          </p>
          {/* Toggle buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { key: "smartphones", label: "Smartphone Ownership", color: T.cool },
              { key: "friendTime", label: "In-Person Friend Time", color: T.growth },
              { key: "loneliness", label: "Loneliness Prevalence", color: T.loneliness },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleLine(key)}
                aria-label={`Toggle ${label}`}
                aria-pressed={lineToggles[key]}
                style={{
                  fontFamily: "'Overpass Mono', monospace", fontSize: 10,
                  letterSpacing: "0.04em",
                  padding: "8px 16px", borderRadius: 20,
                  border: `1px solid ${lineToggles[key] ? color : T.border}`,
                  background: lineToggles[key] ? `${color}15` : T.surface,
                  color: lineToggles[key] ? color : T.inkLight,
                  cursor: "pointer",
                  fontWeight: lineToggles[key] ? 700 : 400,
                  transition: prefersReducedMotion ? "none" : "all 0.2s ease",
                }}
              >
                <span style={{
                  display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                  background: lineToggles[key] ? color : T.border,
                  marginRight: 8, verticalAlign: "middle",
                  transition: prefersReducedMotion ? "none" : "background 0.2s ease",
                }} />
                {label}
              </button>
            ))}
          </div>

          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "28px 20px 16px",
          }}>
            <ResponsiveContainer width="100%" height={460}>
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
                    type="monotone" dataKey="smartphones" stroke={T.cool}
                    strokeWidth={2.5} dot={false}
                    activeDot={{ r: 5, fill: T.cool, stroke: T.surface, strokeWidth: 2 }}
                  />
                )}
                {lineToggles.friendTime && (
                  <Line
                    type="monotone" dataKey="friendTime" stroke={T.growth}
                    strokeWidth={2.5} dot={false}
                    activeDot={{ r: 5, fill: T.growth, stroke: T.surface, strokeWidth: 2 }}
                  />
                )}
                {lineToggles.loneliness && (
                  <Line
                    type="monotone" dataKey="loneliness" stroke={T.loneliness}
                    strokeWidth={2.5} dot={false}
                    activeDot={{ r: 5, fill: T.loneliness, stroke: T.surface, strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reading guide */}
          <div style={{
            marginTop: 20, padding: "16px 20px",
            background: T.surfaceAlt, borderRadius: 8,
            maxWidth: 680, marginLeft: "auto", marginRight: "auto",
          }}>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, lineHeight: 1.65,
              color: T.ink, margin: 0,
            }}>
              <strong>Follow the dashed line.</strong> In 2014, smartphones crossed 50% ownership.
              That&rsquo;s when in-person friend time (green) begins its steepest drop &mdash; falling
              from 5 hours/week to 3. Loneliness (purple) rises in near-mirror image.
              Try toggling each line off to see the two that remain.
            </p>
          </div>

          {/* Source notes */}
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.8 }}>
              Smartphone data: Pew Research Center &middot; Friend time: ATUS, BLS (hours/week, scaled for visual comparison) &middot; Loneliness: Cigna / Harvard / APA
            </Mono>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NARRATIVE BRIDGE — What the chart means
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="bridge" style={{ ...wrap, padding: "56px 28px 40px", ...anim("bridge") }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 18, lineHeight: 1.75,
            color: T.inkMuted, margin: "0 0 20px",
          }}>
            Three lines. Two decades. One pattern.
          </p>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, lineHeight: 1.75,
            color: T.inkMuted, margin: 0,
          }}>
            As connection tools multiplied, the time we spend with the people
            physically around us collapsed. The loneliness that followed wasn&rsquo;t
            a coincidence &mdash; it was a consequence. Below is where it happened,
            who it hit, and where the connection went.
          </p>
        </div>
      </section>

      {/* ═══ THIN DIVIDER ═══ */}
      <div style={{ maxWidth: 120, margin: "0 auto", borderTop: `1px solid ${T.border}` }} />

      {/* ═══════════════════════════════════════════════════════════
          THE VANISHING THIRD PLACE
          Big stat → context columns → supporting data
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="vanishing" style={{ padding: "72px 28px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 12px" }}>
          <span
            aria-label="37 percent"
            style={{
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(80px, 12vw, 140px)", fontWeight: 700,
              color: T.ink, lineHeight: 1, display: "block",
            }}
          >
            {friendDropCount}%
          </span>
        </div>
        <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 20,
            color: T.inkMuted, lineHeight: 1.5, margin: "0 0 6px",
          }}>
            decline in time Americans spend with friends
          </p>
          <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.6 }}>
            2014&ndash;2019, before the pandemic &middot; American Time Use Survey, BLS
          </Mono>
        </div>
      </section>

      {/* Where the third places went */}
      <section data-a="places" style={{ ...wrap, padding: "48px 28px 64px", ...anim("places") }}>
        <Mono bold color={T.inkMuted} size={10} style={{
          display: "block", marginBottom: 24, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Where the third places went
        </Mono>

        {/* Three stats with vertical dividers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 0, alignItems: "start" }}>
          <div style={{ padding: "0 24px 0 0" }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 44, fontWeight: 700,
              color: T.decline, lineHeight: 1, marginBottom: 12,
            }}>68%</div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, lineHeight: 1.5, margin: "0 0 8px",
            }}>of bowling centers have closed since peak</p>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              ~12,000 &rarr; ~3,800 &middot; IBISWorld
            </Mono>
          </div>
          <div style={{ background: T.border, alignSelf: "stretch" }} />
          <div style={{ padding: "0 24px" }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 18, fontWeight: 700,
              color: T.caution, lineHeight: 1, marginBottom: 12,
            }}>Below 50%</div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, lineHeight: 1.5, margin: "0 0 8px",
            }}>US church membership &mdash; first time in 80 years of Gallup tracking</p>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              Gallup, 2021
            </Mono>
          </div>
          <div style={{ background: T.border, alignSelf: "stretch" }} />
          <div style={{ padding: "0 0 0 24px" }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 18, fontWeight: 700,
              color: T.cool, lineHeight: 1, marginBottom: 12,
            }}>55% &rarr; 27%</div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, lineHeight: 1.5, margin: "0 0 8px",
            }}>men with 6+ close friends</p>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              Zero close friends: 3% &rarr; 15% &middot; Survey Center on American Life, 2021
            </Mono>
          </div>
        </div>

        {/* Supporting context */}
        <div style={{
          marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
        }}>
          <div style={{ paddingRight: 24, borderRight: `1px solid ${T.border}` }}>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.inkMuted, lineHeight: 1.6, margin: 0,
            }}>
              Face-to-face interaction down <strong style={{ color: T.ink }}>30%</strong> from 2003&ndash;2022.
              For teenagers, nearly <strong style={{ color: T.ink }}>45%</strong>.
            </p>
            <Mono size={9} color={T.inkLight} style={{ display: "block", marginTop: 6 }}>ATUS, BLS</Mono>
          </div>
          <div style={{ paddingLeft: 24 }}>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.inkMuted, lineHeight: 1.6, margin: 0,
            }}>
              Time with non-household family: <strong style={{ color: T.ink }}>35 min/day</strong> (2003)
              &rarr; <strong style={{ color: T.ink }}>22 min/day</strong> (2020).
            </p>
            <Mono size={9} color={T.inkLight} style={{ display: "block", marginTop: 6 }}>ATUS, BLS</Mono>
          </div>
        </div>

        <p style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.5,
          color: T.ink, fontStyle: "italic", maxWidth: 600, margin: "48px 0 0",
        }}>
          Third places &mdash; the bowling alleys, diners, churches, and barbershops where
          people used to encounter each other without planning to &mdash; are disappearing
          faster than we&rsquo;re replacing them.
        </p>
      </section>

      {/* ═══ THIN DIVIDER ═══ */}
      <div style={{ maxWidth: 120, margin: "0 auto", borderTop: `1px solid ${T.border}` }} />

      {/* ═══════════════════════════════════════════════════════════
          THE LONELIEST GENERATION — Big number, then stacked evidence
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="generation" style={{ padding: "80px 28px 32px" }}>
        <div style={{ ...wrap }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 48, alignItems: "baseline" }}>
            <span
              aria-label="61 percent"
              style={{
                fontFamily: "'Overpass Mono', monospace",
                fontSize: "clamp(72px, 10vw, 120px)", fontWeight: 700,
                color: T.accent, lineHeight: 1,
              }}
            >
              {lonelyGenCount}%
            </span>
            <div>
              <p style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 22, fontWeight: 500,
                color: T.ink, lineHeight: 1.4, margin: "0 0 8px",
              }}>
                of young adults (18&ndash;25) report serious loneliness
              </p>
              <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.6 }}>
                Harvard Making Caring Common, 2021
              </Mono>
            </div>
          </div>
        </div>
      </section>

      {/* Stacked evidence */}
      <section style={{ ...wrap, padding: "32px 28px 40px" }}>
        <div data-a="billion" style={{
          borderTop: `1px solid ${T.border}`, padding: "32px 0",
          display: "grid", gridTemplateColumns: "180px 1fr", gap: 32, alignItems: "baseline",
          ...anim("billion"),
        }}>
          <div style={{
            fontFamily: "'Overpass Mono', monospace", fontSize: 36, fontWeight: 700,
            color: T.loneliness, lineHeight: 1,
          }}>{billionCount} billion+</div>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.6, margin: "0 0 6px",
            }}>
              people worldwide report loneliness &mdash; 24% of the global population.
            </p>
            <Mono size={9} color={T.inkLight}>Meta-Gallup, 142 countries, 2023</Mono>
          </div>
        </div>

        <div data-a="weekly" style={{
          borderTop: `1px solid ${T.border}`, padding: "32px 0",
          display: "grid", gridTemplateColumns: "180px 1fr", gap: 32, alignItems: "baseline",
          ...anim("weekly"),
        }}>
          <div style={{
            fontFamily: "'Overpass Mono', monospace", fontSize: 36, fontWeight: 700,
            color: T.decline, lineHeight: 1,
          }}>1 in 3</div>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.6, margin: "0 0 6px",
            }}>
              US adults feel lonely at least weekly.
            </p>
            <Mono size={9} color={T.inkLight}>APA, 2024</Mono>
          </div>
        </div>

        <div data-a="remote" style={{
          borderTop: `1px solid ${T.border}`, padding: "32px 0",
          display: "grid", gridTemplateColumns: "180px 1fr", gap: 32, alignItems: "baseline",
          ...anim("remote"),
        }}>
          <div style={{
            fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
            color: T.caution, lineHeight: 1,
          }}>25% vs 16%</div>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.6, margin: "0 0 6px",
            }}>
              Fully remote workers report loneliness at a higher rate than on-site workers.
            </p>
            <Mono size={9} color={T.inkLight}>Household Pulse Survey, 2024</Mono>
          </div>
        </div>

        {/* Health impact quote */}
        <div data-a="health" style={{
          borderTop: `1px solid ${T.border}`, padding: "40px 0",
          ...anim("health"),
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: "clamp(20px, 2.5vw, 26px)",
            lineHeight: 1.5, color: T.ink, margin: "0 0 10px", fontStyle: "italic",
            maxWidth: 620,
          }}>
            &ldquo;Lacking social connection carries mortality risk comparable to smoking
            up to 15 cigarettes per day.&rdquo;
          </p>
          <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.6 }}>
            Holt-Lunstad et al., PLoS Medicine, 2010 &middot; Endorsed by U.S. Surgeon General, 2023
          </Mono>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
            color: T.inkMuted, lineHeight: 1.6, margin: "20px 0 0", maxWidth: 560,
          }}>
            Global social isolation prevalence rose <strong style={{ color: T.ink }}>13.4%</strong> over 16 years.
            The entire increase occurred after 2019.
            <br />
            <Mono size={9} color={T.inkLight}>JAMA Network Open, 2025</Mono>
          </p>
        </div>
      </section>

      {/* ═══ THIN DIVIDER ═══ */}
      <div style={{ maxWidth: 120, margin: "0 auto", borderTop: `1px solid ${T.border}` }} />

      {/* ═══════════════════════════════════════════════════════════
          THE REDIRECT — Where did connection go?
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="redirect" style={{ ...wrap, padding: "64px 28px 48px", ...anim("redirect") }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px",
        }}>
          Where did connection go?
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 560, margin: "0 0 48px",
        }}>
          The need didn&rsquo;t disappear. It was rerouted through screens.
        </p>

        {/* Evidence rows */}
        <div style={{
          display: "grid", gridTemplateColumns: "200px 1fr", gap: 24,
          padding: "28px 0", borderTop: `1px solid ${T.border}`,
          alignItems: "baseline",
        }}>
          <Mono bold size={10} color={T.accent} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Parasocial<br/>Relationships
          </Mono>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.65, margin: "0 0 6px",
            }}>
              <strong>51%</strong> of Americans have likely been in a parasocial relationship.
              Academic publications on the topic between 2016&ndash;2020 exceeded the prior 60 years combined.
            </p>
            <Mono size={9} color={T.inkLight}>Thriveworks</Mono>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "200px 1fr", gap: 24,
          padding: "28px 0", borderTop: `1px solid ${T.border}`,
          alignItems: "baseline",
        }}>
          <Mono bold size={10} color={T.accent} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Meeting<br/>Partners
          </Mono>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.65, margin: "0 0 6px",
            }}>
              Meeting online surpassed meeting through friends for the first time in <strong>2013</strong>.
              Meeting through family, church, and neighborhood have all been in steady decline since 1940.
            </p>
            <Mono size={9} color={T.inkLight}>Stanford &ldquo;How Couples Meet&rdquo; study</Mono>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "200px 1fr", gap: 24,
          padding: "28px 0", borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          alignItems: "baseline",
        }}>
          <Mono bold size={10} color={T.accent} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Texting vs.<br/>Talking
          </Mono>
          <div>
            <p style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 16,
              color: T.ink, lineHeight: 1.65, margin: "0 0 6px",
            }}>
              Americans text at <strong>5x</strong> the rate of phone calls (~32 texts/day vs ~6 calls).
              90% of Gen Z check texts within 5 minutes &mdash; yet Gen Z reports the highest loneliness of any generation.
            </p>
            <Mono size={9} color={T.inkLight}>SimpleTexting / Cigna U.S. Loneliness Index</Mono>
          </div>
        </div>

        <p style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 20, lineHeight: 1.5,
          color: T.ink, fontStyle: "italic", maxWidth: 600, margin: "48px 0 0",
        }}>
          The friction of in-person interaction &mdash; the awkwardness, the vulnerability, the
          effort of showing up &mdash; wasn&rsquo;t a bug. It was the mechanism through which
          connection actually formed.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CLOSING — Centered, cinematic
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="close" style={{
        padding: "80px 28px 96px", textAlign: "center",
        ...anim("close"),
      }}>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 18, lineHeight: 1.75,
          color: T.inkMuted, maxWidth: 520, margin: "0 auto 36px",
        }}>
          Some connections require friction. The effort of showing up, the discomfort of
          small talk, the inconvenience of being somewhere at a specific time &mdash; these
          weren&rsquo;t obstacles to connection. They <em style={{ color: T.ink }}>were</em> connection.
        </p>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.35,
          color: T.ink, maxWidth: 560, margin: "0 auto", fontStyle: "italic",
        }}>
          The best-designed systems of the next decade won&rsquo;t just connect people faster.
          They&rsquo;ll create reasons for people to be in the same room.
        </p>
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
          [data-a="places"] > div:nth-child(2) {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          [data-a="places"] > div:nth-child(2) > div:nth-child(2n) {
            display: none !important;
          }
          [data-a="places"] > div:nth-child(2) > div {
            padding: 0 !important;
          }
          [data-a="places"] > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
          [data-a="places"] > div:nth-child(3) > div {
            padding: 0 !important;
            border: none !important;
          }
          [data-a="generation"] > div > div {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          [data-a="redirect"] > div[style*="200px"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="180px"] {
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
