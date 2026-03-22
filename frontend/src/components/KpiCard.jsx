/* ── KpiCard — reusable metric card with sparkline + trend ────── */

const TIER_MAP = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", shadow: "rgba(255,71,87,.11)" },
  high:     { color: "var(--amber)", bg: "var(--amber-dim)", shadow: "rgba(245,166,35,.11)" },
  medium:   { color: "var(--blue)", bg: "var(--blue-dim)", shadow: "rgba(61,157,255,.11)" },
  low:      { color: "var(--teal)", bg: "var(--teal-dim)", shadow: "rgba(0,212,170,.11)" },
};

const KpiCard = ({
  label = "",
  value = "—",
  trend,
  trendLabel = "customers",
  tier = "low",
  sparklineData = [],
  index = 0,
}) => {
  const t = TIER_MAP[tier] || TIER_MAP.low;

  /* ── sparkline helpers (SVG polyline from y-values) ── */
  const sparkW = 76;
  const sparkH = 38;
  const pts = sparklineData.length
    ? sparklineData
        .map((y, i) => {
          const x = (i / (sparklineData.length - 1)) * sparkW;
          const minY = Math.min(...sparklineData);
          const maxY = Math.max(...sparklineData);
          const range = maxY - minY || 1;
          const sy = sparkH - ((y - minY) / range) * (sparkH - 4) - 2;
          return `${x.toFixed(1)},${sy.toFixed(1)}`;
        })
        .join(" ")
    : "";

  const areaPath = pts
    ? `M0,${sparkH} L${pts
        .split(" ")
        .map((p) => `${p}`)
        .join(" L")} L${sparkW},${sparkH}Z`
    : "";

  /* ── trend direction ── */
  const isUp = typeof trend === "string" ? trend.startsWith("+") || trend.startsWith("↑") : Number(trend) > 0;
  const trendColor = isUp ? "var(--red)" : "var(--teal)";
  const trendBg = isUp ? "var(--red-dim)" : "var(--teal-dim)";
  const trendArrow = isUp ? "↑" : "↓";

  return (
    <article
      className="kpi-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 13,
        padding: 18,
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
        animation: `kpi-fadeUp 0.44s ease both`,
        animationDelay: `${0.04 * index}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--border-hi)";
        e.currentTarget.style.boxShadow = `0 8px 36px ${t.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* ── Top colored bar ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 12,
          right: 12,
          height: 2,
          borderRadius: "0 0 2px 2px",
          background: t.color,
        }}
      />

      {/* ── Header row: label + icon ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          className="ff-mono"
          style={{
            fontSize: 8.5,
            color: "var(--txt3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>

        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: t.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={t.color}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
          </svg>
        </div>
      </div>

      {/* ── Value ── */}
      <div
        className="ff-disp"
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: t.color,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          marginBottom: 10,
        }}
      >
        {value}
      </div>

      {/* ── Sub row: trend badge + label ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {trend != null && (
          <span
            className="ff-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontWeight: 700,
              color: trendColor,
              background: trendBg,
              padding: "2px 7px",
              borderRadius: 6,
              letterSpacing: "0.02em",
            }}
          >
            {trendArrow} {typeof trend === "string" ? trend.replace(/^[↑↓+\-]/, "") : Math.abs(Number(trend))}%
          </span>
        )}
        <span className="ff-mono" style={{ fontSize: 9.5, color: "var(--txt3)" }}>
          {trendLabel}
        </span>
      </div>

      {/* ── Sparkline (SVG, absolute bottom-right) ── */}
      {pts && (
        <svg
          width={sparkW}
          height={sparkH}
          viewBox={`0 0 ${sparkW} ${sparkH}`}
          style={{
            position: "absolute",
            bottom: 8,
            right: 10,
            opacity: 0.28,
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id={`kpi-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={t.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#kpi-grad-${index})`} />
          <polyline
            points={pts}
            fill="none"
            stroke={t.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* ── keyframe (injected once) ── */}
      <style>{`
        @keyframes kpi-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </article>
  );
};

export default KpiCard;
