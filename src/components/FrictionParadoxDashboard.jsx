"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area,
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
};

// ─── BEFORE/AFTER TASK DATA ──────────────────────────────────────
const taskPairs = [
  { task: "Deposit a check", then: "Drive to bank, fill out slip, wait in line", now: "Open app, take photo, done in 12 seconds" },
  { task: "Buy a concert ticket", then: "Call venue, wait on hold, read card number aloud", now: "Tap notification, Apple Pay, confirmation in 3 seconds" },
  { task: "Pay a bill", then: "Write check, address envelope, buy stamp, mail it", now: "Auto-pay deducts on the 1st — you never see it leave" },
  { task: "Get directions", then: "Unfold map, plan route, ask a stranger", now: "\"Hey Siri, navigate to...\"" },
  { task: "Buy a product", then: "Drive to store, browse, compare, carry to register", now: "One click. Arrives tomorrow." },
];

// ─── ACCOMPLISHMENT CURVE DATA (CONCEPTUAL) ─────────────────────
// Bell-shaped curve: satisfaction peaks at intermediate difficulty
const curveData = [];
for (let i = 0; i <= 100; i += 2) {
  const x = i / 100;
  // Bell curve centered at 0.5, sigma ~0.2
  const y = Math.exp(-Math.pow((x - 0.5), 2) / (2 * 0.04));
  curveData.push({
    difficulty: i,
    satisfaction: Math.round(y * 100),
    difficultyLabel: i === 0 ? "None" : i === 50 ? "Moderate" : i === 100 ? "Extreme" : "",
  });
}

const scenarios = [
  {
    key: "check1995",
    label: "Deposit a check (1995)",
    color: T.cool,
    x: 45,
    desc: "Drive to bank, fill out slip, wait, interact with teller. Moderate effort. Tangible completion.",
  },
  {
    key: "check2025",
    label: "Deposit a check (2025)",
    color: T.accent,
    x: 8,
    desc: "Open app, take photo, done in 12 seconds. Zero effort. No felt sense of accomplishment.",
  },
  {
    key: "flow",
    label: "The Flow Zone",
    color: T.growth,
    x: 50,
    desc: "Challenge matched to skill. Where humans report the greatest engagement and satisfaction.",
    isZone: true,
  },
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
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration]);
  return active ? value : 0;
}

// ─── CUSTOM AREA TOOLTIP ─────────────────────────────────────────
const CurveTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  let diffLabel = "None";
  if (d.difficulty <= 10) diffLabel = "Very Low";
  else if (d.difficulty <= 30) diffLabel = "Low";
  else if (d.difficulty <= 60) diffLabel = "Moderate";
  else if (d.difficulty <= 80) diffLabel = "High";
  else diffLabel = "Very High";
  return (
    <div style={{
      background: T.ink, color: "#fff", padding: "8px 12px", borderRadius: 4,
      fontFamily: "'Overpass Mono', monospace", fontSize: 11,
    }}>
      <div>Difficulty: {diffLabel}</div>
      <div>Satisfaction: {d.satisfaction > 80 ? "High" : d.satisfaction > 40 ? "Moderate" : "Low"}</div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────
export default function FrictionParadoxDashboard() {
  const [vis, setVis] = useState(new Set(["hero"]));
  const [activeScenario, setActiveScenario] = useState(null);
  const [strikeVisible, setStrikeVisible] = useState(false);

  // Reduced motion preference
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

  const heroCountActive = vis.has("oneclick");
  const heroCount = useCountUp(43, prefersReducedMotion ? 0 : 1200, heroCountActive);

  const anim = (id) => prefersReducedMotion ? {} : ({
    opacity: vis.has(id) ? 1 : 0,
    transform: vis.has(id) ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });

  const wrap = { maxWidth: 1060, margin: "0 auto", padding: "0 28px" };
  const activeS = scenarios.find(s => s.key === activeScenario);

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
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ ...wrap, padding: "64px 28px 20px" }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(38px, 5.5vw, 62px)", fontWeight: 400,
          lineHeight: 1.06, margin: "0 0 28px", maxWidth: 780,
        }}>
          The Friction Paradox
        </h1>
        <div style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 19, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 640, margin: "0 0 40px",
        }}>
          <span style={{ color: T.ink, fontWeight: 500 }}>
            We optimized away the effort.
          </span>{" "}
          Every frictionless improvement below is real: faster, cheaper, more convenient.
          But optimization has side effects. When you remove the friction from a process,
          you also remove the pause, the human interaction, the sense of earned completion.
          This investigation looks at what the research says we lost.
        </div>

        {/* ── Before/After Table ── */}
        <div data-a="hero-table" style={{
          display: "flex", flexDirection: "column", gap: 8,
          marginBottom: 40, ...anim("hero-table"),
        }}>
          {taskPairs.map((pair, i) => (
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
            Every one of these improvements is genuine. But what if the friction
            was doing something we hadn't accounted for?
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: THE ONE-CLICK EFFECT
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="oneclick" style={{ ...wrap, padding: "0 28px 56px", ...anim("oneclick") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part I: The Price Tag
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px", maxWidth: 700,
        }}>
          The One-Click Effect
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 620, margin: "0 0 32px",
        }}>
          One-click checkout was designed to reduce abandoned carts. It also reduced the
          pause between wanting and having. The Cornell effect was concentrated in
          moderate and occasional buyers — the people who previously had time to reconsider.
        </p>

        {/* Hero stat */}
        <div style={{
          display: "flex", alignItems: "baseline", gap: 16,
          marginBottom: 8, flexWrap: "wrap",
        }}>
          <span
            aria-label="43 percent"
            style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 72, fontWeight: 700,
              color: T.accent, lineHeight: 1,
            }}
          >
            {heroCount}%
          </span>
          <span style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 20,
            color: T.ink, fontWeight: 500, maxWidth: 400,
          }}>
            increase in purchase frequency after adopting one-click checkout
          </span>
        </div>
        <Mono size={9} color={T.inkLight} style={{ display: "block", marginBottom: 32, lineHeight: 1.6 }}>
          Dou et al., Management Science, 2023 &middot; 977 customers tracked over 2.5 years
        </Mono>

        {/* Three stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12, marginBottom: 32,
        }}>
          {/* Card 1: 36% more items */}
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "20px 18px",
          }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 32, fontWeight: 700,
              color: T.accent, lineHeight: 1, marginBottom: 8,
            }}>36%</div>
            <div style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, marginBottom: 8,
            }}>more items purchased</div>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              Same Cornell study &middot; concentrated in moderate/occasional buyers
            </Mono>
          </div>

          {/* Card 2: $151/mo impulse spending */}
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "20px 18px",
          }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 32, fontWeight: 700,
              color: T.caution, lineHeight: 1, marginBottom: 8,
            }}>$151/mo</div>
            <div style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, marginBottom: 8,
            }}>average impulse spending per consumer</div>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              Slickdeals/OnePoll, 2023 &middot; N=2,000 &middot; down from $314 in 2022, suggesting consumer awareness of the problem
            </Mono>
          </div>

          {/* Card 3: Friction tools demand */}
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "20px 18px",
          }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 20, fontWeight: 700,
              color: T.cool, lineHeight: 1.2, marginBottom: 8,
            }}>Buyers want friction tools</div>
            <div style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
              color: T.ink, marginBottom: 8,
            }}>Surveyed impulse buyers said they actively want spending limits and checkout delays</div>
            <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
              Moser et al., CHI 2019 &middot; N=151 buyers + 200 site analysis
            </Mono>
          </div>
        </div>

        {/* Post-impulse effects */}
        <div style={{
          padding: "12px 16px", background: T.surfaceAlt, borderRadius: 6, marginBottom: 32,
        }}>
          <Mono size={9} color={T.inkMuted} style={{ display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Self-reported emotional consequences of impulse purchasing (behavioral psychology literature)
          </Mono>
          <div style={{ display: "flex", gap: 20 }}>
            {["financial strain", "guilt", "regret"].map(effect => (
              <span key={effect} style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: T.inkMuted, fontStyle: "italic",
              }}>{effect}</span>
            ))}
          </div>
        </div>

        {/* Transition */}
        <div style={{
          borderLeft: `3px solid ${T.accent}`, padding: "16px 20px", maxWidth: 620,
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 19, lineHeight: 1.45,
            color: T.ink, margin: 0, fontStyle: "italic",
          }}>
            The question is: why does removing a single click have this effect?
            The answer is neuroscience.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE PAIN WE TURNED OFF (Dark section)
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="pain" style={{
        background: T.surfaceDark, color: "#fff", padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("pain") }}>
          <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Part II: The Mechanism
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 28px", maxWidth: 680, color: "#fff",
          }}>
            The Pain We Turned Off
          </h2>

          {/* Two-column layout */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}>
            {/* Left column: Neural Evidence */}
            <div>
              <Mono size={10} color="rgba(255,255,255,0.4)" bold style={{
                display: "block", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em",
              }}>The Neural Evidence</Mono>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Card 1 */}
                <div style={{
                  padding: "16px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
                }}>
                  <p style={{
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                    color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: "0 0 10px",
                  }}>
                    &ldquo;Excessive prices activated the anterior insula and deactivated mesial
                    prefrontal cortex prior to purchase decisions. Brain activity predicted
                    purchases better than self-report.&rdquo;
                  </p>
                  <Mono size={9} color="rgba(255,255,255,0.4)">
                    Knutson et al., Neuron, 2007
                  </Mono>
                </div>

                {/* Card 2 */}
                <div style={{
                  padding: "16px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
                }}>
                  <p style={{
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                    color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: "0 0 10px",
                  }}>
                    &ldquo;Paying activates the anterior insula — a brain region associated with
                    emotional and affective pain processing.&rdquo;
                  </p>
                  <Mono size={9} color="rgba(255,255,255,0.4)">
                    Mazar, Plassmann, Robitaille &amp; Lindner, 2016
                  </Mono>
                </div>

                {/* Card 3 */}
                <div style={{
                  padding: "16px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
                }}>
                  <p style={{
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                    color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: "0 0 10px",
                  }}>
                    &ldquo;Mobile payment reduces the pain of paying. The mechanism is moderated
                    by price level — stronger for high-price purchases, where the
                    'brake' matters most.&rdquo;
                  </p>
                  <Mono size={9} color="rgba(255,255,255,0.4)">
                    Ma et al., PsyCh Journal, 2024
                  </Mono>
                </div>
              </div>
            </div>

            {/* Right column: The Design Gap */}
            <div>
              <Mono size={10} color="rgba(255,255,255,0.4)" bold style={{
                display: "block", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em",
              }}>The Design Gap</Mono>

              <div style={{
                padding: "20px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              }}>
                <p style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                  color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 12px",
                }}>
                  When surveyed, online impulse buyers said they wanted friction tools:
                  spending limits, checkout delays, cost salience reminders. An analysis
                  of 200 top US e-commerce sites found these tools are rarely offered.
                </p>
                <Mono size={9} color="rgba(255,255,255,0.4)" style={{ lineHeight: 1.6 }}>
                  Moser, Resnick &amp; Schoenebeck, CHI 2019 &middot; N=151 buyers + 200 site analysis
                </Mono>
              </div>
            </div>
          </div>

          {/* Punchline */}
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
              The pain of paying wasn&rsquo;t a bug. It was a feature. We optimized it away
              without asking what it was protecting.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: THE DISAPPEARING COUNTER
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="counter" style={{ ...wrap, padding: "56px 28px", ...anim("counter") }}>
        <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Part III: The Isolation
        </Mono>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 12px", maxWidth: 700,
        }}>
          The Disappearing Counter
        </h2>
        <p style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 620, margin: "0 0 8px",
        }}>
          We prefer digital for transactions. We need human for trust.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 32, marginTop: 28,
        }}>
          {/* Left column: Evidence cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Card 1 */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "18px 16px",
            }}>
              <div style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                color: T.cool, lineHeight: 1, marginBottom: 8,
              }}>9%</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: T.ink, marginBottom: 8, lineHeight: 1.5,
              }}>of consumers prefer bank branches for routine banking</div>
              <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                ABA, Oct 2025 &middot; N=4,403 (&plusmn;2pp)
              </Mono>
            </div>

            {/* Card 2 */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "18px 16px",
            }}>
              <div style={{
                fontFamily: "'Overpass Mono', monospace", fontSize: 28, fontWeight: 700,
                color: T.caution, lineHeight: 1, marginBottom: 8,
              }}>67%</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                color: T.ink, marginBottom: 8, lineHeight: 1.5,
              }}>like seeing bank branches in their neighborhood — not to use them, but because they signal stability and availability</div>
              <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                Accenture Global Banking Study, 2025 &middot; N=49,300
              </Mono>
            </div>

            {/* Card 3 */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "18px 16px",
            }}>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: T.ink, marginBottom: 8, lineHeight: 1.55, fontWeight: 500,
              }}>Face-to-face communication was the most important predictor of mental health outcomes during pandemic lockdowns</div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 13,
                color: T.inkMuted, marginBottom: 8, lineHeight: 1.5,
              }}>Videoconferencing showed negligible mental health benefits despite more visual cues than text.</div>
              <Mono size={9} color={T.inkLight} style={{ lineHeight: 1.5 }}>
                Scientific Reports, 2023
              </Mono>
            </div>
          </div>

          {/* Right column: Large stat */}
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", textAlign: "center",
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "40px 24px",
          }}>
            <div style={{
              fontFamily: "'Overpass Mono', monospace", fontSize: 72, fontWeight: 700,
              color: T.accent, lineHeight: 1, marginBottom: 12,
            }}>54%</div>
            <div style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 17,
              color: T.ink, marginBottom: 8, lineHeight: 1.4,
            }}>prefer mobile app banking</div>
            <div style={{
              fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
              color: T.inkMuted, lineHeight: 1.5,
            }}>doubled from 26% in 2017</div>
            <Mono size={9} color={T.inkLight} style={{ marginTop: 12 }}>
              ABA, Oct 2025
            </Mono>
          </div>
        </div>

        {/* Connecting observation */}
        <div style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, lineHeight: 1.65,
          color: T.inkMuted, maxWidth: 620, margin: "28px 0 0",
        }}>
          <p style={{ margin: "0 0 12px" }}>
            The numbers tell a clear story: we chose convenience. But the preference for seeing
            branches — a place you rarely visit — suggests something else is at work.
          </p>
          <p style={{ margin: 0 }}>
            Routine human touchpoints — the bank teller, the travel agent, the store clerk —
            are disappearing before we've measured what they provided beyond the transaction itself.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: THE ACCOMPLISHMENT CURVE — Interactive
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="accomplish" style={{
        background: T.surfaceAlt, borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`, padding: "56px 0",
      }}>
        <div style={{ ...wrap, ...anim("accomplish") }}>
          <Mono bold color={T.accent} size={11} style={{ letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
            Part IV: The Accomplishment Trap
          </Mono>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 24px", maxWidth: 700,
          }}>
            Intermediate difficulty produces the greatest sense of accomplishment
          </h2>

          {/* Caveat ABOVE the chart */}
          <Mono size={10} color={T.inkMuted} style={{ display: "block", marginBottom: 20, lineHeight: 1.6, maxWidth: 600 }}>
            Conceptual illustration of flow state theory (Csikszentmihalyi, 1990) and
            Yerkes-Dodson research. Curve shape is illustrative, not derived from a specific dataset.
          </Mono>

          {/* Toggle buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {scenarios.map(s => {
              const selected = activeScenario === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveScenario(selected ? null : s.key)}
                  aria-label={`View ${s.label} on chart`}
                  style={{
                    fontFamily: "'Overpass Mono', monospace", fontSize: 11,
                    padding: "8px 14px", borderRadius: 4, cursor: "pointer",
                    background: selected ? s.color : T.surfaceAlt,
                    color: selected ? "#fff" : T.inkMuted,
                    border: selected ? `2px solid ${s.color}` : `1px solid ${T.border}`,
                    fontWeight: selected ? 700 : 400,
                    transition: prefersReducedMotion ? "none" : "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.outline = `2px solid ${T.accent}`; }}
                  onBlur={(e) => { e.target.style.outline = "none"; }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "20px 12px 12px", position: "relative",
          }}>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={curveData} margin={{ top: 12, right: 24, bottom: 4, left: 4 }}>
                <CartesianGrid stroke={T.borderLight} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="difficulty"
                  tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 10, fill: T.inkLight }}
                  axisLine={{ stroke: T.border }} tickLine={false}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => {
                    if (v === 0) return "None";
                    if (v === 25) return "Low";
                    if (v === 50) return "Moderate";
                    if (v === 75) return "High";
                    if (v === 100) return "Extreme";
                    return "";
                  }}
                  label={{
                    value: "Difficulty →", position: "insideBottomRight", offset: -4,
                    fill: T.inkLight, fontFamily: "'Overpass Mono', monospace", fontSize: 9,
                  }}
                />
                <YAxis
                  tick={{ fontFamily: "'Overpass Mono', monospace", fontSize: 10, fill: T.inkLight }}
                  axisLine={false} tickLine={false} width={50}
                  ticks={[0, 50, 100]}
                  tickFormatter={(v) => {
                    if (v === 0) return "Low";
                    if (v === 50) return "";
                    if (v === 100) return "Peak";
                    return "";
                  }}
                  label={{
                    value: "Satisfaction (illustrative)", angle: -90, position: "insideLeft",
                    offset: 10, fill: T.inkLight, fontFamily: "'Overpass Mono', monospace", fontSize: 9,
                    dy: 60,
                  }}
                />
                <Tooltip content={<CurveTooltip />} />

                {/* Flow zone shaded region when active */}
                {activeScenario === "flow" && (
                  <Area
                    type="monotone" dataKey="satisfaction"
                    stroke="none" fill={T.growth} fillOpacity={0.12}
                    activeDot={false} isAnimationActive={!prefersReducedMotion}
                  />
                )}

                {/* Main curve - dashed stroke, stippled fill */}
                <Area
                  type="monotone" dataKey="satisfaction"
                  stroke={T.inkMuted} strokeWidth={2}
                  strokeDasharray="6 3"
                  fill={T.inkMuted} fillOpacity={0.04}
                  activeDot={false}
                  isAnimationActive={!prefersReducedMotion}
                />

                {/* Scenario reference line */}
                {activeS && !activeS.isZone && (
                  <ReferenceLine
                    x={activeS.x}
                    stroke={activeS.color}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                )}
                {activeScenario === "flow" && (
                  <>
                    <ReferenceLine x={35} stroke={T.growth} strokeWidth={1} strokeDasharray="3 3" />
                    <ReferenceLine x={65} stroke={T.growth} strokeWidth={1} strokeDasharray="3 3" />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>

            {/* Callout for active scenario */}
            {activeS && (
              <div style={{
                padding: "14px 18px", background: T.surfaceAlt,
                borderRadius: 6, marginTop: 12,
                borderLeft: `3px solid ${activeS.color}`,
                opacity: 1,
                transition: prefersReducedMotion ? "none" : "opacity 0.2s ease 0.3s",
              }}>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: T.ink, lineHeight: 1.55,
                }}>{activeS.desc}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: THE RECLAMATION — Closing
          ═══════════════════════════════════════════════════════════ */}
      <section data-a="close" style={{ ...wrap, padding: "56px 28px", ...anim("close") }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, lineHeight: 1.15,
          margin: "0 0 24px", maxWidth: 680,
        }}>
          Some friction was load-bearing
        </h2>

        <div style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, lineHeight: 1.75,
          color: T.inkMuted, maxWidth: 620,
        }}>
          <p style={{ margin: "0 0 20px" }}>
            The evidence points in two directions at once. Digital convenience genuinely improved
            access and efficiency. But the friction it replaced was doing psychological and social
            work we hadn&rsquo;t accounted for. These are competing goods, not a simple tradeoff.
          </p>
          <p style={{ margin: "0 0 20px" }}>
            Mobile deposits save time. One-click checkout reduces abandoned carts. Auto-pay
            prevents late fees. GPS eliminated the stress of being lost. None of this was a
            mistake. The question isn&rsquo;t whether to reverse these changes — it&rsquo;s whether to design
            the next generation of tools with awareness of what friction provided: a pause before
            purchase, a human option for trust, a sense of earned completion.
          </p>
          <p style={{ margin: 0, color: T.ink }}>
            The design challenge is not to re-introduce inefficiency. It&rsquo;s to preserve
            friction&rsquo;s benefits — the brake, the human moment, the accomplishment — without
            requiring the cost that friction originally imposed.
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
            The best-designed systems of the next decade won&rsquo;t be the fastest.
            They&rsquo;ll be the ones that know when to slow down.
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
            <strong style={{ color: T.inkMuted }}>One-click checkout:</strong> Dou, Hu &amp; Wu,
            &ldquo;One-Click Away: The Effect of One-Click Buying on Purchase Decisions,&rdquo;
            Management Science, Feb 2023. N=977 customers at large Asian retailer,
            Jan 2016–Aug 2018.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Impulse spending:</strong> Slickdeals/OnePoll
            Annual Survey, May 2023. N=2,000 US consumers. Self-reported.
            Note: down 50% from 2022.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Pain of paying:</strong> Knutson, Rick, Wimmer,
            Prelec &amp; Loewenstein, &ldquo;Neural Predictors of Purchases,&rdquo; Neuron, Jan 2007.
            Mazar, Plassmann, Robitaille &amp; Lindner, &ldquo;Pain of Paying,&rdquo; 2016.
            Ma et al., PsyCh Journal, 2024.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Friction tools:</strong> Moser, Resnick &amp;
            Schoenebeck, &ldquo;Impulse Buying: Design Practices and Consumer Needs,&rdquo;
            CHI 2019. N=151 + 200 site analysis.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Banking preferences:</strong> American Bankers
            Association / Morning Consult, Oct 2025. N=4,403, &plusmn;2pp.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Branch sentiment:</strong> Accenture Global
            Banking Consumer Study, 2025. N=49,300 across 39 countries.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Mental health:</strong> Scientific Reports, 2023.
            Face-to-face communication as predictor of mental health during pandemic lockdowns.
            <br/><br/>
            <strong style={{ color: T.inkMuted }}>Flow theory:</strong> Csikszentmihalyi, M.
            (1990). <em>Flow: The Psychology of Optimal Experience.</em> Harper &amp; Row.
            Chart is conceptual illustration, not measured data.
            <br/><br/>
            Built by Alison &middot; Feb 2026
          </div>
        </div>
      </footer>

      {/* ── Mobile responsive overrides via style tag ── */}
      <style>{`
        @media (max-width: 640px) {
          [data-a="hero-table"] > div {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
          [data-a="pain"] > div > div:nth-child(3),
          [data-a="counter"] > div:nth-child(4) {
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
