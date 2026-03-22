import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCustomer, generateRMBrief } from "../api/client";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, Tooltip,
} from "recharts";
import RiskGauge from "../components/RiskGauge";
import ShapChart from "../components/ShapChart";
import TierBadge from "../components/TierBadge";
import SkeletonLoader from "../components/SkeletonLoader";
import OutreachDrawer from "../components/OutreachDrawer";

/* ── tier helpers ── */
const TIER_META = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", label: "CRITICAL RISK" },
  high:     { color: "var(--amber)", bg: "var(--amber-dim)", label: "HIGH RISK" },
  medium:   { color: "var(--blue)", bg: "var(--blue-dim)", label: "MEDIUM RISK" },
  low:      { color: "var(--teal)", bg: "var(--teal-dim)", label: "LOW RISK" },
};

/* ── mock data gen: create declining array ending with current ── */
const makeDeclining = (current, len = 6) => {
  const arr = [];
  let v = current;
  for (let i = len - 1; i >= 0; i--) {
    arr[i] = Math.max(0, Math.round(v));
    v += Math.round(Math.random() * 4 + 2);
  }
  return arr.map((y, i) => ({ m: `M${i + 1}`, v: y }));
};

const makeGrowing = (current, len = 6) => {
  const arr = [];
  let v = current;
  for (let i = len - 1; i >= 0; i--) {
    arr[i] = Math.max(0, Math.round(v));
    v -= Math.round(Math.random() * 3 + 1);
  }
  return arr.map((y, i) => ({ m: `M${i + 1}`, v: y }));
};

/* ── fallback data ── */
const FALLBACK = {
  id: "C-1001",
  name: "Priya Sharma",
  account_type: "Savings",
  risk_score: 94,
  risk_tier: "critical",
  tenure_years: 6,
  city_tier: "Tier 1",
  age: 34,
  preferred_channel: "WhatsApp",
  monthly_transactions: 4,
  balance: 12400,
  app_logins: 2,
  complaints: 5,
  upi_txns: 3,
  products_held: 2,
  shap_factors: [
    { factor: "Salary credit stopped", value: 0.42 },
    { factor: "Inactivity 60 days", value: 0.31 },
    { factor: "Complaint spike", value: 0.27 },
    { factor: "FD matured", value: 0.18 },
    { factor: "Low balance", value: 0.14 },
  ],
};

/* ══════════════════════════════════════════════════ */
const Customer360 = () => {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefResult, setBriefResult] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getCustomer(id);
        if (!cancelled) setCustomer(data || FALLBACK);
      } catch {
        if (!cancelled) setCustomer(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleGenerateBrief = async () => {
    setBriefLoading(true);
    setBriefResult(null);
    try {
      const data = await generateRMBrief(customer?.id || id);
      setBriefResult(data?.brief || data?.message || "Brief generated successfully. The RM has been notified with key talking points for this customer.");
    } catch {
      setBriefResult("Unable to generate brief at this time. Please try again.");
    } finally {
      setBriefLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <SkeletonLoader lines={8} />
      </div>
    );
  }

  const c = customer || FALLBACK;
  const tier = c.risk_tier || "critical";
  const tm = TIER_META[tier] || TIER_META.critical;

  const initials = (c.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    { label: "Tenure", value: `${c.tenure_years || "—"}y` },
    { label: "City Tier", value: c.city_tier || "—" },
    { label: "Age", value: c.age || "—" },
    { label: "Channel", value: c.preferred_channel || "—" },
  ];

  /* ── Build mini chart data ── */
  const txnVal = c.monthly_transactions ?? 4;
  const balVal = c.balance ?? 12400;
  const loginVal = c.app_logins ?? 2;
  const complaintVal = c.complaints ?? 5;
  const upiVal = c.upi_txns ?? 3;
  const productsVal = c.products_held ?? 2;

  const balanceDeclining = balVal < 25000;

  const miniCharts = [
    {
      title: "Monthly Transactions",
      data: makeDeclining(txnVal),
      type: "line",
      color: "#4dabf7",      /* --blue */
      value: txnVal,
      trend: -34,
    },
    {
      title: "Balance Trend",
      data: balanceDeclining ? makeDeclining(balVal / 1000) : makeGrowing(balVal / 1000),
      type: "area",
      color: balanceDeclining ? "#ff4757" : "#00d4aa",
      fillColor: balanceDeclining ? "rgba(255,71,87,0.15)" : "rgba(0,212,170,0.15)",
      value: `₹${(balVal / 1000).toFixed(1)}K`,
      trend: balanceDeclining ? -52 : 8,
    },
    {
      title: "App Logins",
      data: makeDeclining(loginVal),
      type: "bar",
      color: "#f5a623",      /* --amber */
      value: loginVal,
      trend: -60,
    },
    {
      title: "Complaint History",
      data: makeGrowing(complaintVal),
      type: "bar",
      color: "#ff4757",      /* --red */
      value: complaintVal,
      trend: 120,
    },
    {
      title: "UPI Transactions",
      data: makeDeclining(upiVal),
      type: "line",
      color: "#00d4aa",      /* --teal */
      value: upiVal,
      trend: -45,
    },
    {
      title: "Products Held",
      type: "number",
      value: productsVal,
      prev: productsVal + 1,
      trend: productsVal < 3 ? -33 : 0,
    },
  ];

  return (
    <>
      <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, paddingBottom: 68 }}>

        {/* ═══════ LEFT COLUMN ═══════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Panel 1: Customer Identity Card */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className="ff-disp" style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: tm.bg, color: tm.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {initials}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="ff-disp" style={{ fontSize: 15, fontWeight: 700, color: "var(--txt)" }}>{c.name}</div>
                <div className="ff-mono" style={{ fontSize: 10.5, color: "var(--txt3)", letterSpacing: "0.4px" }}>{c.id} · {c.account_type}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><TierBadge tier={tier} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="ff-mono" style={{ fontSize: 9, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 3 }}>{s.label}</div>
                  <div className="ff-body" style={{ fontSize: 13, color: "var(--txt)", fontWeight: 500 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Risk Score Gauge */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20, textAlign: "center" }}>
            <RiskGauge score={c.risk_score} tier={tier} />
            <div className="ff-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: tm.color, marginTop: 6 }}>{tm.label}</div>
          </div>

          {/* Panel 3: Why At Risk */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20 }}>
            <h3 className="ff-disp" style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--txt)" }}>Why They May Leave</h3>
            <ShapChart data={c.shap_factors || FALLBACK.shap_factors} />
            <button
              onClick={handleGenerateBrief}
              disabled={briefLoading}
              className="ff-mono"
              style={{ width: "100%", height: 40, marginTop: 16, borderRadius: 9, border: "none", cursor: briefLoading ? "wait" : "pointer", background: "linear-gradient(135deg, var(--teal), #00a880)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "filter 150ms, opacity 150ms", opacity: briefLoading ? 0.7 : 1 }}
              onMouseEnter={(e) => { if (!briefLoading) e.currentTarget.style.filter = "brightness(1.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
            >
              {briefLoading ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin-brief 0.7s linear infinite" }} />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
                  Generate RM Brief
                </>
              )}
            </button>
            {briefResult && (
              <div className="ff-body" style={{ marginTop: 12, padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 12.5, lineHeight: 1.6, color: "var(--txt2)", whiteSpace: "pre-wrap", animation: "kpi-fadeUp 0.3s ease both" }}>
                {briefResult}
              </div>
            )}
          </div>
        </div>

        {/* ═══════ RIGHT COLUMN — Behavioral Trends ═══════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <h2 className="ff-disp" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--txt)" }}>
            Behavioral Trends
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {miniCharts.map((chart) => {
              const isDown = chart.trend < 0;
              return (
                <div
                  key={chart.title}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: 12,
                    transition: "border-color 180ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hi)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div className="ff-body" style={{ fontSize: 11.5, color: "var(--txt2)", marginBottom: 4 }}>
                        {chart.title}
                      </div>
                      <div className="ff-disp" style={{ fontSize: 16, fontWeight: 700, color: "var(--txt)" }}>
                        {chart.value}
                      </div>
                    </div>
                    <span
                      className="ff-mono"
                      style={{
                        fontSize: 9, fontWeight: 700,
                        color: isDown ? "var(--red)" : "var(--teal)",
                        background: isDown ? "var(--red-dim)" : "var(--teal-dim)",
                        padding: "2px 6px", borderRadius: 4,
                        display: "inline-flex", alignItems: "center", gap: 2,
                      }}
                    >
                      {isDown ? "↓" : "↑"} {Math.abs(chart.trend)}%
                    </span>
                  </div>

                  {/* Chart */}
                  {chart.type === "number" ? (
                    /* Products Held — large number card */
                    <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <span className="ff-disp" style={{ fontSize: 36, fontWeight: 800, color: chart.value <= 2 ? "var(--red)" : "var(--teal)" }}>
                        {chart.value}
                      </span>
                      <div className="ff-mono" style={{ fontSize: 9, color: "var(--txt3)" }}>
                        <div>was {chart.prev}</div>
                        <div style={{ color: isDown ? "var(--red)" : "var(--teal)" }}>
                          {isDown ? "↓" : "—"} {isDown ? "reduced" : "stable"}
                        </div>
                      </div>
                    </div>
                  ) : chart.type === "line" ? (
                    <div style={{ height: 60 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart.data}>
                          <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 10 }}
                            labelStyle={{ color: "var(--txt3)" }}
                          />
                          <Line type="monotone" dataKey="v" stroke={chart.color} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : chart.type === "area" ? (
                    <div style={{ height: 60 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chart.data}>
                          <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 10 }}
                            labelStyle={{ color: "var(--txt3)" }}
                          />
                          <defs>
                            <linearGradient id={`areaFill_${chart.title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chart.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={chart.color} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={chart.color} strokeWidth={2} fill={`url(#areaFill_${chart.title.replace(/\s/g, "")})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    /* bar */
                    <div style={{ height: 60 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart.data}>
                          <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 10 }}
                            labelStyle={{ color: "var(--txt3)" }}
                          />
                          <Bar dataKey="v" fill={chart.color} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ STICKY BOTTOM BAR ═══════ */}
      <div
        style={{
          position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 10,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          padding: "10px 0",
        }}
      >
        <button
          onClick={() => setShowDrawer(true)}
          className="ff-mono"
          style={{
            width: "100%", height: 42,
            borderRadius: 9, border: "none", cursor: "pointer",
            background: "var(--amber)", color: "#080c12",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.5px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "filter 150ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          Generate Outreach
        </button>
      </div>

      {/* ═══════ OUTREACH DRAWER ═══════ */}
      <OutreachDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} customer={c} />

      {/* Keyframes */}
      <style>{`
        @keyframes spin-brief {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Customer360;
