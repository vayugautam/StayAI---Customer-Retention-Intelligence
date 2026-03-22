import { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCampaigns, getCampaignAnalytics } from "../api/client";
import SkeletonLoader from "../components/SkeletonLoader";

/* ── Fallback mock data ── */
const FALLBACK_ANALYTICS = {
  total_outreach: 48200,
  avg_response_rate: 31.4,
  total_retained: 6780,
  revenue_saved: 172000000,
  monthly: [
    { month: "Oct", outreach: 5400, responses: 1620 },
    { month: "Nov", outreach: 6100, responses: 2013 },
    { month: "Dec", outreach: 7200, responses: 2448 },
    { month: "Jan", outreach: 8500, responses: 2975 },
    { month: "Feb", outreach: 9800, responses: 3430 },
    { month: "Mar", outreach: 11200, responses: 3808 },
  ],
  segments: [
    { segment: "Salary Stop", rate: 34.2 },
    { segment: "FD Maturity", rate: 28.6 },
    { segment: "High Withdrawal", rate: 22.1 },
    { segment: "Inactivity 60d", rate: 18.4 },
    { segment: "Complaint Spike", rate: 12.8 },
  ],
};

const FALLBACK_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Salary Stop Winback",
    segment: "Salary Stopped",
    status: "active",
    launch_date: "2025-12-01",
    reach: 12400,
    response_rate: 34.2,
    retained: 2840,
    revenue_saved: 58000000,
  },
  {
    id: "camp-2",
    name: "FD Maturity Renewal",
    segment: "FD Matured",
    status: "active",
    launch_date: "2026-01-15",
    reach: 8600,
    response_rate: 28.6,
    retained: 1720,
    revenue_saved: 42000000,
  },
  {
    id: "camp-3",
    name: "Dormant Re-engagement",
    segment: "Inactivity 60d",
    status: "completed",
    launch_date: "2025-10-10",
    reach: 6200,
    response_rate: 18.4,
    retained: 960,
    revenue_saved: 24000000,
  },
  {
    id: "camp-4",
    name: "High-Value Retention",
    segment: "High Withdrawal",
    status: "active",
    launch_date: "2026-02-01",
    reach: 4800,
    response_rate: 22.1,
    retained: 680,
    revenue_saved: 31000000,
  },
  {
    id: "camp-5",
    name: "Complaint Resolution",
    segment: "Complaint Spike",
    status: "completed",
    launch_date: "2025-09-20",
    reach: 3400,
    response_rate: 12.8,
    retained: 340,
    revenue_saved: 8600000,
  },
  {
    id: "camp-6",
    name: "Premium Upsell",
    segment: "Low Balance",
    status: "active",
    launch_date: "2026-03-05",
    reach: 2800,
    response_rate: 26.3,
    retained: 240,
    revenue_saved: 8400000,
  },
];

/* ── helpers ── */
const formatCr = (val) => {
  const cr = val / 10000000;
  return cr >= 10 ? `₹${Math.round(cr)}Cr` : `₹${cr.toFixed(2)}Cr`;
};

const formatLakh = (val) => {
  const lakh = val / 100000;
  return lakh >= 10 ? `${Math.round(lakh)}` : lakh.toFixed(1);
};

const segBarColor = (rate) => {
  if (rate > 25) return "#00d4aa";
  if (rate >= 15) return "#f5a623";
  return "#ff4757";
};

/* ══════════════════════════════════════════════════ */
const Campaigns = () => {
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [aData, cData] = await Promise.all([
          getCampaignAnalytics(),
          getCampaigns(),
        ]);
        if (!cancelled) {
          setAnalytics(aData || FALLBACK_ANALYTICS);
          setCampaigns(cData?.campaigns || cData || FALLBACK_CAMPAIGNS);
        }
      } catch {
        if (!cancelled) {
          setAnalytics(FALLBACK_ANALYTICS);
          setCampaigns(FALLBACK_CAMPAIGNS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const a = analytics || FALLBACK_ANALYTICS;
  const campList = campaigns.length ? campaigns : FALLBACK_CAMPAIGNS;

  /* KPI definitions */
  const kpis = [
    { label: "TOTAL OUTREACH", value: a.total_outreach?.toLocaleString() || "—", color: "#4dabf7", icon: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" },
    { label: "AVG RESPONSE RATE", value: `${a.avg_response_rate || 0}%`, color: "#00d4aa", icon: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" },
    { label: "CUSTOMERS RETAINED", value: a.total_retained?.toLocaleString() || "—", color: "#00d4aa", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { label: "REVENUE SAVED", value: formatCr(a.revenue_saved || 0), color: "#f5a623", icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" },
  ];

  if (loading) {
    return (
      <section style={{ display: "grid", gap: 18 }}>
        <SkeletonLoader type="kpi-grid" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 13, height: 280 }} />
          <div style={{ background: "var(--bg-card)", borderRadius: 13, height: 280 }} />
        </div>
        <SkeletonLoader lines={6} />
      </section>
    );
  }

  return (
    <section style={{ display: "grid", gap: 18 }}>
      {/* ── Page Header ── */}
      <div>
        <h1 className="ff-disp" style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--txt)" }}>
          Campaign Analytics
        </h1>
        <p className="ff-body" style={{ margin: "4px 0 0", fontSize: 12.5, fontWeight: 300, color: "var(--txt2)" }}>
          Outreach performance across all retention campaigns
        </p>
      </div>

      {/* ══════════ SECTION 1: KPI ROW ══════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 13, padding: 18,
              transition: "border-color 180ms, transform 180ms",
              cursor: "default",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hi)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span className="ff-mono" style={{ fontSize: 8.5, letterSpacing: "2px", color: "var(--txt3)" }}>
                {kpi.label}
              </span>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: `${kpi.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={kpi.color}><path d={kpi.icon} /></svg>
              </span>
            </div>
            <div className="ff-disp" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ SECTION 2: CHARTS ══════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* LEFT: Monthly Outreach vs Response */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 className="ff-mono" style={{ margin: 0, fontSize: 9, letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--txt3)" }}>
              Monthly Outreach vs Response
            </h3>
            <div style={{ display: "flex", gap: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(77,171,247,0.6)" }} />
                <span className="ff-mono" style={{ fontSize: 8.5, color: "var(--txt3)" }}>Outreach</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: "#00d4aa" }} />
                <span className="ff-mono" style={{ fontSize: 8.5, color: "var(--txt3)" }}>Responses</span>
              </span>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={a.monthly || FALLBACK_ANALYTICS.monthly}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontFamily: "'Space Mono'", fontSize: 8.5, fill: "var(--txt3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'Space Mono'", fontSize: 8.5, fill: "var(--txt3)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "'Space Mono'" }}
                  labelStyle={{ color: "var(--txt3)" }}
                />
                <Bar dataKey="outreach" fill="rgba(77,171,247,0.6)" radius={[4, 4, 0, 0]} barSize={28} />
                <Line type="monotone" dataKey="responses" stroke="#00d4aa" strokeWidth={2.5} dot={{ r: 3, fill: "#00d4aa" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Response rate by segment */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 className="ff-mono" style={{ margin: "0 0 14px", fontSize: 9, letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--txt3)" }}>
            Response Rate by Segment
          </h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(a.segments || FALLBACK_ANALYTICS.segments).map((s) => ({
                  ...s, fill: segBarColor(s.rate),
                }))}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontFamily: "'Space Mono'", fontSize: 8.5, fill: "var(--txt3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="segment" tick={{ fontFamily: "'Space Mono'", fontSize: 9, fill: "var(--txt2)" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "'Space Mono'" }}
                  labelStyle={{ color: "var(--txt3)" }}
                  formatter={(v) => [`${v}%`, "Rate"]}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={16}>
                  {(a.segments || FALLBACK_ANALYTICS.segments).map((s, i) => (
                    <rect key={i} fill={segBarColor(s.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ══════════ SECTION 3: CAMPAIGN CARDS ══════════ */}
      <div>
        <h2 className="ff-mono" style={{ margin: "0 0 14px", fontSize: 9, letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--txt3)" }}>
          All Campaigns
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {campList.map((camp) => {
            const isActive = camp.status === "active";
            const lakhSaved = formatLakh(camp.revenue_saved || 0);
            return (
              <div
                key={camp.id}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 13, padding: 16,
                  transition: "border-color 180ms, transform 180ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hi)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Top: Name + Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div className="ff-disp" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--txt)", lineHeight: 1.3 }}>
                    {camp.name}
                  </div>
                  <span
                    className="ff-mono"
                    style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
                      padding: "2px 7px", borderRadius: 3, flexShrink: 0,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: isActive ? "var(--teal-dim)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "var(--teal)" : "var(--txt3)",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "var(--teal)" : "var(--txt3)" }} />
                    {isActive ? "Active" : "Completed"}
                  </span>
                </div>

                {/* Segment badge + launch date */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    className="ff-mono"
                    style={{
                      fontSize: 8.5, fontWeight: 600, letterSpacing: "0.5px",
                      padding: "2px 7px", borderRadius: 3,
                      background: "var(--amber-dim)", color: "var(--amber)",
                    }}
                  >
                    {camp.segment}
                  </span>
                  <span className="ff-mono" style={{ fontSize: 10, color: "var(--txt3)" }}>
                    {camp.launch_date}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Reach", value: camp.reach?.toLocaleString(), color: "#4dabf7" },
                    { label: "Response", value: `${camp.response_rate}%`, color: segBarColor(camp.response_rate) },
                    { label: "Retained", value: camp.retained?.toLocaleString(), color: "#00d4aa" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="ff-mono" style={{ fontSize: 8, letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 3 }}>
                        {s.label}
                      </div>
                      <div className="ff-disp" style={{ fontSize: 14, fontWeight: 700, color: s.color }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue saved */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <span className="ff-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)" }}>
                    ₹{lakhSaved} lakh saved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Campaigns;
