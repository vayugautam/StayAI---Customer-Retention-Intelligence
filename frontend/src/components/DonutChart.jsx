import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = {
  Critical: "#ff4757",
  High: "#f5a623",
  Medium: "#3d9dff",
  "Low / Healthy": "#00d4aa",
  Low: "#00d4aa",
  Healthy: "#00d4aa",
};

const DonutChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PieChart width={150} height={150}>
        <Pie
          data={data}
          cx={75}
          cy={75}
          innerRadius={45}
          outerRadius={65}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, idx) => (
            <Cell
              key={entry.name || idx}
              fill={entry.color || COLORS[entry.name] || "#4dabf7"}
              opacity={0.82}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 11,
            fontFamily: "'Space Mono', monospace",
          }}
          labelStyle={{ color: "var(--txt3)" }}
        />
      </PieChart>
    </div>
  );
};

export default DonutChart;
