import { useEffect, useState } from "react";

const ShapChart = ({ data = [], factors }) => {
  const items = factors || data;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!items || items.length === 0) {
    return (
      <div
        className="ff-body"
        style={{
          padding: 20,
          textAlign: "center",
          color: "var(--txt3)",
          fontSize: 12,
        }}
      >
        No risk factors available
      </div>
    );
  }

  return (
    <div>
      {items.map((item, idx) => {
        const pct = Math.round((item.value || 0) * 100);
        const widthPct = Math.min(100, (item.value || 0) * 100);

        return (
          <div key={item.factor || idx} style={{ marginBottom: 9 }}>
            {/* Top row: factor name + value */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 5,
              }}
            >
              <span
                className="ff-body"
                style={{ fontSize: 11.5, color: "var(--txt2)" }}
              >
                {item.factor}
              </span>
              <span
                className="ff-mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--amber)",
                  fontWeight: 600,
                }}
              >
                +{pct}%
              </span>
            </div>

            {/* Track */}
            <div
              style={{
                height: 5,
                background: "rgba(255,255,255,0.045)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  width: animated ? `${widthPct}%` : "0%",
                  background:
                    "linear-gradient(90deg, var(--amber), rgba(245,166,35,.45))",
                  transition: "width 1.2s cubic-bezier(.34,1.56,.64,1)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShapChart;
