/* ── Shimmer bar helper ── */
const S = ({ w = "100%", h = 12, r = 4, style = {} }) => (
  <div
    style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "skel-shimmer 1.8s infinite",
      ...style,
    }}
  />
);

const SkeletonLoader = ({ type = "lines", lines = 4 }) => {
  /* ── kpi-grid: 4 skeleton cards ── */
  if (type === "kpi-grid") {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 13, padding: 18, height: 112,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}
            >
              <S w="55%" h={8} />
              <S w="70%" h={36} r={6} />
              <S w="40%" h={8} />
            </div>
          ))}
        </div>
        <style>{shimmerCSS}</style>
      </>
    );
  }

  /* ── table: panel with 5 skeleton rows ── */
  if (type === "table") {
    return (
      <>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, overflow: "hidden" }}>
          {/* Header bar */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
            <S w="140px" h={14} />
            <S w="40px" h={18} r={3} />
          </div>
          {/* Rows */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 18px", height: 48,
                borderBottom: i < 4 ? "1px solid var(--border)" : "none",
              }}
            >
              <S w={30} h={30} r={7} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <S w="120px" h={10} />
                <S w="70px" h={7} />
              </div>
              <S w="80px" h={5} r={3} />
              <S w="50px" h={16} r={3} />
              <S w="70px" h={10} />
              <S w="55px" h={10} />
              <S w="60px" h={24} r={5} />
            </div>
          ))}
        </div>
        <style>{shimmerCSS}</style>
      </>
    );
  }

  /* ── customer360: 2-column layout ── */
  if (type === "customer360") {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18 }}>
          {/* Left: 3 stacked panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Identity card */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <S w={38} h={38} r={9} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                  <S w="60%" h={14} />
                  <S w="40%" h={9} />
                </div>
              </div>
              <S w="55px" h={18} r={3} style={{ marginBottom: 16 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}><S w="50%" h={7} style={{ marginBottom: 4 }} /><S w="65%" h={12} /></div>
                ))}
              </div>
            </div>
            {/* Gauge */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20, textAlign: "center" }}>
              <S w={160} h={160} r={80} style={{ margin: "0 auto 10px" }} />
              <S w="50px" h={10} style={{ margin: "0 auto" }} />
            </div>
            {/* SHAP */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 20 }}>
              <S w="45%" h={14} style={{ marginBottom: 14 }} />
              {[0.84, 0.62, 0.54, 0.36, 0.28].map((w, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <S w="35%" h={10} /><S w="30px" h={10} />
                  </div>
                  <S w={`${w * 100}%`} h={5} r={3} />
                </div>
              ))}
              <S w="100%" h={40} r={9} style={{ marginTop: 14 }} />
            </div>
          </div>
          {/* Right: 6 mini chart cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <S w="45%" h={16} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div><S w="80px" h={10} style={{ marginBottom: 6 }} /><S w="40px" h={16} /></div>
                    <S w="40px" h={18} r={4} />
                  </div>
                  <S w="100%" h={60} r={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{shimmerCSS}</style>
      </>
    );
  }

  /* ── campaigns: 4 kpi + 2 charts ── */
  if (type === "campaigns") {
    return (
      <>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18, height: 112 }}>
                <S w="55%" h={8} style={{ marginBottom: 16 }} />
                <S w="65%" h={28} r={6} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18, height: 280 }}>
                <S w="55%" h={9} style={{ marginBottom: 14 }} />
                <S w="100%" h={220} r={6} />
              </div>
            ))}
          </div>
        </div>
        <style>{shimmerCSS}</style>
      </>
    );
  }

  /* ── default: simple lines ── */
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <S key={i} w={`${70 + Math.random() * 30}%`} h={12} />
        ))}
      </div>
      <style>{shimmerCSS}</style>
    </>
  );
};

const shimmerCSS = `
  @keyframes skel-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
`;

export default SkeletonLoader;
