const TIER = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", label: "Critical" },
  high:     { color: "var(--amber)", bg: "var(--amber-dim)", label: "High" },
  medium:   { color: "var(--blue)", bg: "var(--blue-dim)", label: "Medium" },
  low:      { color: "var(--teal)", bg: "var(--teal-dim)", label: "Low" },
};

const TierBadge = ({ tier = "low" }) => {
  const t = TIER[tier] || TIER.low;

  return (
    <span
      className="ff-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontFamily: "'Space Mono', monospace",
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: "1px",
        textTransform: "uppercase",
        padding: "3px 7px",
        borderRadius: 3,
        color: t.color,
        background: t.bg,
      }}
    >
      {/* dot */}
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: t.color,
          flexShrink: 0,
        }}
      />
      {t.label}
    </span>
  );
};

export default TierBadge;
