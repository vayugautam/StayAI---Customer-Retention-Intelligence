import { useEffect, useState } from "react";

const TIER_COLOR = {
  critical: "var(--red)",
  high: "var(--amber)",
  medium: "var(--blue)",
  low: "var(--teal)",
};

const ScoreBar = ({ score = 0, tier }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const resolvedTier =
    tier || (safeScore >= 80 ? "critical" : safeScore >= 60 ? "high" : safeScore >= 30 ? "medium" : "low");
  const color = TIER_COLOR[resolvedTier] || TIER_COLOR.low;

  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(safeScore), 100);
    return () => clearTimeout(t);
  }, [safeScore]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {/* Score number */}
      <span
        className="ff-mono"
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color,
          minWidth: 26,
          textAlign: "right",
        }}
      >
        {safeScore}
      </span>

      {/* Track */}
      <div
        style={{
          flex: 1,
          height: 3,
          background: "rgba(255,255,255,.055)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            borderRadius: 2,
            background: color,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;
