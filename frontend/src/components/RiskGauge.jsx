import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const TIER_COLORS = {
  critical: "#ff4757",
  high: "#f5a623",
  medium: "#3d9dff",
  low: "#00d4aa",
};

const RiskGauge = ({ score = 0, tier }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  /* auto-resolve tier from score if not provided */
  const resolvedTier =
    tier || (safeScore >= 80 ? "critical" : safeScore >= 60 ? "high" : safeScore >= 30 ? "medium" : "low");

  const color = TIER_COLORS[resolvedTier] || TIER_COLORS.critical;

  /* mount animation: start at 0, animate to actual after 300ms */
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(safeScore), 300);
    return () => clearTimeout(timer);
  }, [safeScore]);

  const data = [{ value: displayScore, fill: color }];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <RadialBarChart
        width={160}
        height={160}
        innerRadius={50}
        outerRadius={70}
        startAngle={180}
        endAngle={0}
        data={data}
        barSize={12}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
        <RadialBar
          dataKey="value"
          cornerRadius={8}
          background={{ fill: "rgba(255,255,255,0.04)" }}
          angleAxisId={0}
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </RadialBarChart>

      {/* Center text overlay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          marginTop: -8,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="ff-disp"
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: color,
            lineHeight: 1,
          }}
        >
          {safeScore}
        </div>
        <div
          className="ff-mono"
          style={{
            fontSize: 8.5,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--txt3)",
            marginTop: 4,
          }}
        >
          Risk Score
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
