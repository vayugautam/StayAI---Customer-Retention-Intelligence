import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const MOCK_DATA = [
  { month: "Oct", atRisk: 980, retained: 420 },
  { month: "Nov", atRisk: 1040, retained: 510 },
  { month: "Dec", atRisk: 1120, retained: 640 },
  { month: "Jan", atRisk: 1180, retained: 720 },
  { month: "Feb", atRisk: 1260, retained: 810 },
  { month: "Mar", atRisk: 1240, retained: 890 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8, padding: "8px 12px",
      }}
    >
      <div className="ff-mono" style={{ fontSize: 9, color: "var(--txt3)", marginBottom: 4, letterSpacing: "0.5px" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: 1, background: p.color, flexShrink: 0 }} />
          <span className="ff-body" style={{ fontSize: 11, color: "var(--txt2)" }}>
            {p.dataKey === "atRisk" ? "At-Risk" : "Retained"}
          </span>
          <span className="ff-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--txt)", marginLeft: "auto" }}>
            {p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const TrendChart = ({ data }) => {
  const chartData = data || MOCK_DATA;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,71,87,0.22)" />
            <stop offset="100%" stopColor="rgba(255,71,87,0)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="rgba(255,255,255,0.036)"
          strokeDasharray="0"
          horizontal={true}
          vertical={false}
        />

        <XAxis
          dataKey="month"
          tick={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, fill: "var(--txt3)" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis hide={true} />

        <Tooltip content={<CustomTooltip />} cursor={false} />

        <Area
          type="monotone"
          dataKey="atRisk"
          stroke="#ff4757"
          strokeWidth={1.8}
          fill="url(#riskGrad)"
        />

        <Line
          type="monotone"
          dataKey="retained"
          stroke="#00d4aa"
          strokeWidth={1.4}
          strokeDasharray="4 3"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
