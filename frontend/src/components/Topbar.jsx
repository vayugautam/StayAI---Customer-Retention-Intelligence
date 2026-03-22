import { useEffect, useState } from "react";

const Topbar = () => {
  const [clock, setClock] = useState(formatTime());

  useEffect(() => {
    const id = setInterval(() => setClock(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 68,
        right: 0,
        height: 58,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 26px",
        zIndex: 20,
      }}
    >
      {/* ── Left: Brand + Subtitle ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* Brand */}
        <span
          className="ff-disp"
          style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "#fff" }}>Stay</span>
          <span style={{ color: "var(--amber)" }}>AI</span>
        </span>

        {/* Divider + Subtitle */}
        <span
          className="ff-mono"
          style={{
            fontSize: 9.5,
            color: "var(--txt3)",
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            borderLeft: "1px solid var(--border-hi)",
            paddingLeft: 18,
          }}
        >
          Customer Intelligence Platform
        </span>
      </div>

      {/* ── Right: LIVE + Clock + Avatar ── */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* LIVE badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--teal)",
              boxShadow: "0 0 6px var(--teal)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            className="ff-mono"
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: "var(--teal)",
              letterSpacing: "0.08em",
            }}
          >
            LIVE
          </span>
        </span>

        {/* Clock */}
        <span
          className="ff-mono"
          style={{ fontSize: 10.5, color: "var(--txt3)" }}
        >
          {clock}
        </span>

        {/* Avatar */}
        <span
          className="ff-disp"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg, #3d9dff 0%, #00d4aa 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            userSelect: "none",
          }}
        >
          RA
        </span>
      </div>
    </header>
  );
};

/* ── Helpers ─────────────────────────────────────────── */
function formatTime() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export default Topbar;
