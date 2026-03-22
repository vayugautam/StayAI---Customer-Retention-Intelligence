import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary, getCustomers } from "../api/client";
import KpiCard from "../components/KpiCard";
import SkeletonLoader from "../components/SkeletonLoader";
import DonutChart from "../components/DonutChart";
import ScoreBar from "../components/ScoreBar";
import TierBadge from "../components/TierBadge";

/* ── tier helpers ─────────────────────────────────── */
const TIER_META = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", label: "Critical" },
  high:     { color: "var(--amber)", bg: "var(--amber-dim)", label: "High" },
  medium:   { color: "var(--blue)", bg: "var(--blue-dim)", label: "Medium" },
  low:      { color: "var(--teal)", bg: "var(--teal-dim)", label: "Low / Healthy" },
};

const SPARKLINES = {
  critical: [18, 22, 20, 28, 26, 30],
  high: [14, 18, 16, 22, 20, 24],
  medium: [30, 26, 28, 22, 24, 20],
  low: [10, 14, 12, 18, 16, 20],
};

const TIER_ORDER = ["critical", "high", "medium", "low"];

/* ── fallback data ── */
const FALLBACK_TIERS = {
  critical: { label: "CRITICAL RISK", count: 1240, trend: "+12.3", trendLabel: "customers" },
  high:     { label: "HIGH RISK", count: 3310, trend: "+5.7", trendLabel: "customers" },
  medium:   { label: "MEDIUM RISK", count: 6200, trend: "-2.1", trendLabel: "customers" },
  low:      { label: "HEALTHY", count: 9250, trend: "-8.4", trendLabel: "customers" },
};

const FALLBACK_TOP5 = [
  { id: "C-1001", name: "Priya Sharma", account_type: "Savings", risk_score: 94, tier: "critical" },
  { id: "C-1002", name: "Rahul Verma", account_type: "Current", risk_score: 91, tier: "critical" },
  { id: "C-1003", name: "Ankit Patel", account_type: "Savings", risk_score: 87, tier: "critical" },
  { id: "C-1004", name: "Meera Joshi", account_type: "Salary", risk_score: 82, tier: "critical" },
  { id: "C-1005", name: "Vikram Singh", account_type: "Current", risk_score: 78, tier: "high" },
];

const FALLBACK_CUSTOMERS = [
  { id: "C-1001", name: "Priya Sharma", account_type: "Savings", risk_score: 94, tier: "critical", top_signal: "Salary stopped", channel: "WhatsApp" },
  { id: "C-1002", name: "Rahul Verma", account_type: "Current", risk_score: 91, tier: "critical", top_signal: "High withdrawal", channel: "Email" },
  { id: "C-1003", name: "Ankit Patel", account_type: "Savings", risk_score: 87, tier: "critical", top_signal: "Complaint spike", channel: "SMS" },
  { id: "C-1006", name: "Sneha Iyer", account_type: "Salary", risk_score: 76, tier: "high", top_signal: "Inactivity 45d", channel: "WhatsApp" },
  { id: "C-1007", name: "Arjun Reddy", account_type: "Current", risk_score: 72, tier: "high", top_signal: "FD pre-closure", channel: "Email" },
  { id: "C-1004", name: "Meera Joshi", account_type: "Salary", risk_score: 68, tier: "high", top_signal: "Low balance", channel: "Call" },
  { id: "C-1008", name: "Kavita Nair", account_type: "Savings", risk_score: 55, tier: "medium", top_signal: "Txn decline", channel: "SMS" },
  { id: "C-1009", name: "Deepak Gupta", account_type: "Current", risk_score: 48, tier: "medium", top_signal: "Channel shift", channel: "WhatsApp" },
  { id: "C-1010", name: "Ritu Malhotra", account_type: "Salary", risk_score: 42, tier: "medium", top_signal: "Support ticket", channel: "Email" },
  { id: "C-1005", name: "Vikram Singh", account_type: "Current", risk_score: 22, tier: "low", top_signal: "Stable", channel: "Email" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
];

/* ══════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  /* ── summary state ── */
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(true);

  /* ── customer table state ── */
  const [customers, setCustomers] = useState([]);
  const [custLoading, setCustLoading] = useState(true);
  const [activeTier, setActiveTier] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 8;

  /* ── fetch summary ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDashboardSummary();
        if (!cancelled) setSummary(data);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── fetch customers ── */
  const fetchCustomers = useCallback(async () => {
    setCustLoading(true);
    try {
      const filters = {
        tier: activeTier === "all" ? undefined : activeTier,
        search: search || undefined,
        page,
        limit: LIMIT,
        sort: "risk_score_desc",
      };
      const data = await getCustomers(filters);
      if (data?.customers) {
        setCustomers(data.customers);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.customers.length) / LIMIT));
      } else {
        /* fallback */
        const filtered = activeTier === "all"
          ? FALLBACK_CUSTOMERS
          : FALLBACK_CUSTOMERS.filter((c) => c.tier === activeTier);
        const searched = search
          ? filtered.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
          : filtered;
        setCustomers(searched.slice((page - 1) * LIMIT, page * LIMIT));
        setTotalPages(Math.max(1, Math.ceil(searched.length / LIMIT)));
      }
    } catch {
      const filtered = activeTier === "all"
        ? FALLBACK_CUSTOMERS
        : FALLBACK_CUSTOMERS.filter((c) => c.tier === activeTier);
      const searched = search
        ? filtered.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        : filtered;
      setCustomers(searched.slice((page - 1) * LIMIT, page * LIMIT));
      setTotalPages(Math.max(1, Math.ceil(searched.length / LIMIT)));
    } finally {
      setCustLoading(false);
    }
  }, [activeTier, search, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  /* ── derived data ── */
  const tiers = summary?.tiers || FALLBACK_TIERS;
  const top5 = summary?.top_5_risk || FALLBACK_TOP5;
  const totalCustomers = TIER_ORDER.reduce((s, t) => s + (tiers[t]?.count || 0), 0);

  const kpiCards = TIER_ORDER.map((tier) => {
    const t = tiers[tier] || {};
    return {
      tier,
      label: t.label || TIER_META[tier].label,
      value: t.count != null ? Number(t.count).toLocaleString() : "—",
      trend: t.trend, trendLabel: t.trendLabel || "customers",
      sparklineData: SPARKLINES[tier],
    };
  });

  const donutData = TIER_ORDER.map((tier) => ({
    name: TIER_META[tier].label, value: tiers[tier]?.count || 0,
  }));

  const criticalCount = tiers.critical?.count || 0;

  /* ── filter color helper ── */
  const filterColor = (key) => {
    if (key === "all") return "var(--amber)";
    return TIER_META[key]?.color || "var(--txt2)";
  };

  return (
    <section style={{ display: "grid", gap: 18 }}>
      {/* ══════════ PAGE HEADER ══════════ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="ff-disp" style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--txt)" }}>
            Retention Command Center
          </h1>
          <p className="ff-body" style={{ margin: "4px 0 0", fontSize: 12.5, fontWeight: 300, color: "var(--txt2)" }}>
            Real-time churn intelligence across {totalCustomers.toLocaleString()} customers
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border-hi)", background: "transparent", color: "var(--txt2)", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--txt3)"; e.currentTarget.style.color = "var(--txt)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hi)"; e.currentTarget.style.color = "var(--txt2)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
            Export
          </button>
          <button
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 8, border: "none", background: "var(--amber)", color: "#080c12", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "filter 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            Launch Campaign
          </button>
        </div>
      </div>

      {/* ══════════ ALERT BAR ══════════ */}
      {alertVisible && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,71,87,0.07)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 9, padding: "9px 15px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 8px var(--red)", animation: "pulse-dot 2s ease-in-out infinite", flexShrink: 0 }} />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--red)" style={{ flexShrink: 0 }}><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
          <span className="ff-body" style={{ fontSize: 12, color: "var(--txt)", flex: 1 }}>
            <strong style={{ color: "var(--red)" }}>3 new Critical alerts</strong> — Priya Sharma, Rahul Verma, Ankit Patel flagged for immediate outreach
          </span>
          <button onClick={() => setAlertVisible(false)} style={{ background: "transparent", border: "none", color: "var(--txt3)", cursor: "pointer", padding: 4, lineHeight: 1, fontSize: 16, transition: "color 150ms" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--txt)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--txt3)"; }} title="Dismiss">✕</button>
        </div>
      )}

      {/* ══════════ KPI GRID ══════════ */}
      {loading ? (
        <SkeletonLoader type="kpi-grid" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
          {kpiCards.map((card, idx) => (
            <KpiCard key={card.tier} label={card.label} value={card.value} trend={card.trend} trendLabel={card.trendLabel} tier={card.tier} index={idx} sparklineData={card.sparklineData} />
          ))}
        </div>
      )}

      {/* ══════════ TWO-COLUMN AREA ══════════ */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 18 }}>

          {/* ═══════ LEFT: At-Risk Customer Table ═══════ */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, overflow: "hidden" }}>

            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 className="ff-disp" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--txt)" }}>
                  At-Risk Customers
                </h3>
                <span className="ff-mono" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--amber)", background: "var(--amber-dim)", padding: "2px 7px", borderRadius: 3 }}>
                  Live
                </span>
              </div>
              <button
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border-hi)", background: "transparent", cursor: "pointer", transition: "border-color 150ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--txt3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hi)"; }}
                title="Sort"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--txt3)"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
              </button>
            </div>

            {/* Filter row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", margin: "10px 0 0", background: "rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {FILTERS.map((f) => {
                  const active = activeTier === f.key;
                  const fc = filterColor(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => { setActiveTier(f.key); setPage(1); }}
                      className="ff-mono"
                      style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase",
                        padding: "4px 10px", borderRadius: 5, cursor: "pointer",
                        border: active ? `1px solid ${fc}` : "1px solid var(--border)",
                        background: active ? (f.key === "all" ? "var(--amber-dim)" : TIER_META[f.key]?.bg || "transparent") : "transparent",
                        color: active ? fc : "var(--txt3)",
                        transition: "all 150ms",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search customer…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="ff-mono"
                style={{
                  width: 175, height: 27, padding: "0 10px",
                  fontSize: 10, color: "var(--txt)", letterSpacing: "0.3px",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: 5, outline: "none",
                  transition: "border-color 180ms",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--amber)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>

            {/* Table */}
            <div style={{ padding: "0 0 4px" }}>
              {/* Header row */}
              <div
                className="ff-mono"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 0.7fr 0.9fr 0.6fr 0.7fr",
                  gap: 6, padding: "10px 18px",
                  fontSize: 8.5, fontWeight: 700, letterSpacing: "1.2px",
                  textTransform: "uppercase", color: "var(--txt3)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>Customer</span>
                <span>Risk Score</span>
                <span>Tier</span>
                <span>Top Signal</span>
                <span>Channel</span>
                <span style={{ textAlign: "right" }}>Action</span>
              </div>

              {/* Body */}
              {custLoading ? (
                <div style={{ padding: 18 }}><SkeletonLoader lines={5} /></div>
              ) : customers.length === 0 ? (
                <div className="ff-mono" style={{ padding: 30, textAlign: "center", color: "var(--txt3)", fontSize: 11 }}>
                  No customers found
                </div>
              ) : (
                customers.map((cust) => {
                  const tm = TIER_META[cust.tier] || TIER_META.low;
                  const initials = (cust.name || "")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={cust.id}
                      onClick={() => navigate(`/customer/${cust.id}`)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr 0.7fr 0.9fr 0.6fr 0.7fr",
                        gap: 6, padding: "10px 18px",
                        alignItems: "center", cursor: "pointer",
                        borderBottom: "1px solid var(--border)",
                        transition: "background 120ms",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.023)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Customer */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span
                          className="ff-disp"
                          style={{
                            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                            background: tm.bg, color: tm.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700,
                          }}
                        >
                          {initials}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div className="ff-body" style={{ fontSize: 12.5, color: "var(--txt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cust.name}
                          </div>
                          <div className="ff-mono" style={{ fontSize: 9, color: "var(--txt3)", letterSpacing: "0.4px" }}>
                            {cust.account_type}
                          </div>
                        </div>
                      </div>

                      {/* Risk Score */}
                      <ScoreBar score={cust.risk_score} tier={cust.tier} />

                      {/* Tier */}
                      <TierBadge tier={cust.tier} />

                      {/* Top Signal */}
                      <span
                        className="ff-mono"
                        style={{
                          fontSize: 9, fontWeight: 500,
                          color: "var(--txt2)", background: "var(--bg-elevated)",
                          padding: "3px 7px", borderRadius: 4,
                          display: "inline-block", maxWidth: "100%",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}
                      >
                        {cust.top_signal}
                      </span>

                      {/* Channel */}
                      <span className="ff-mono" style={{ fontSize: 10, color: "var(--txt2)" }}>
                        {cust.channel}
                      </span>

                      {/* Action */}
                      <div style={{ textAlign: "right" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/customer/${cust.id}`); }}
                          className="ff-mono"
                          style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.4px",
                            padding: "4px 10px", borderRadius: 5, cursor: "pointer",
                            border: "1px solid var(--amber)", background: "var(--amber-dim)",
                            color: "var(--amber)", transition: "all 150ms",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--amber)"; e.currentTarget.style.color = "#080c12"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--amber-dim)"; e.currentTarget.style.color = "var(--amber)"; }}
                        >
                          Outreach →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "10px 18px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="ff-mono"
                style={{
                  fontSize: 10, padding: "4px 10px", borderRadius: 5, cursor: page <= 1 ? "default" : "pointer",
                  border: "1px solid var(--border)", background: "transparent",
                  color: page <= 1 ? "var(--txt3)" : "var(--txt2)",
                  opacity: page <= 1 ? 0.4 : 1, transition: "opacity 150ms",
                }}
              >
                ← Prev
              </button>
              <span className="ff-mono" style={{ fontSize: 10, color: "var(--txt3)" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="ff-mono"
                style={{
                  fontSize: 10, padding: "4px 10px", borderRadius: 5, cursor: page >= totalPages ? "default" : "pointer",
                  border: "1px solid var(--border)", background: "transparent",
                  color: page >= totalPages ? "var(--txt3)" : "var(--txt2)",
                  opacity: page >= totalPages ? 0.4 : 1, transition: "opacity 150ms",
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN ═══════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Panel 1: Risk Distribution */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18, position: "relative" }}>
              <h3 className="ff-mono" style={{ margin: "0 0 12px", fontSize: 9, letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--txt3)" }}>
                Risk Distribution
              </h3>
              <div style={{ position: "relative" }}>
                <DonutChart data={donutData} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div className="ff-disp" style={{ fontSize: 30, fontWeight: 800, color: "var(--red)", lineHeight: 1 }}>{criticalCount}</div>
                  <div className="ff-mono" style={{ fontSize: 8.5, letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", marginTop: 2 }}>Critical</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {TIER_ORDER.map((tier) => {
                  const count = tiers[tier]?.count || 0;
                  const pct = totalCustomers ? ((count / totalCustomers) * 100).toFixed(1) : "0.0";
                  const m = TIER_META[tier];
                  return (
                    <div key={tier} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                      <span className="ff-body" style={{ fontSize: 12, color: "var(--txt2)", flex: 1 }}>{m.label}</span>
                      <span className="ff-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--txt)" }}>{count.toLocaleString()}</span>
                      <span className="ff-mono" style={{ fontSize: 10, color: "var(--txt3)", minWidth: 40, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel 2: Highest Risk */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 className="ff-mono" style={{ margin: 0, fontSize: 9, letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--txt3)" }}>Highest Risk</h3>
                <span className="ff-mono" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--red)", background: "var(--red-dim)", padding: "2px 7px", borderRadius: 3 }}>Urgent</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {top5.map((cust, idx) => {
                  const tm = TIER_META[cust.tier] || TIER_META.critical;
                  const initials = cust.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={cust.id} onClick={() => navigate(`/customer/${cust.id}`)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", transition: "background 120ms" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.022)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span className="ff-mono" style={{ fontSize: 9.5, color: "var(--txt3)", minWidth: 14, textAlign: "center" }}>{idx + 1}</span>
                      <span className="ff-disp" style={{ width: 28, height: 28, borderRadius: 7, background: tm.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 700, color: tm.color, flexShrink: 0 }}>{initials}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ff-body" style={{ fontSize: 12.5, color: "var(--txt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cust.name}</div>
                        <div className="ff-mono" style={{ fontSize: 9, color: "var(--txt3)", letterSpacing: "0.5px" }}>{cust.account_type}</div>
                      </div>
                      <span className="ff-mono" style={{ fontSize: 10, fontWeight: 700, color: tm.color, background: tm.bg, padding: "3px 8px", borderRadius: 5, minWidth: 32, textAlign: "center" }}>{cust.risk_score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
