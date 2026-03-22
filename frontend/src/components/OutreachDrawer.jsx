import { useEffect, useState, useRef, useCallback } from "react";
import { generateMessage } from "../api/client";
import TierBadge from "./TierBadge";
import ShapChart from "./ShapChart";

/* ── tier helpers ── */
const TIER_META = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", label: "Critical Risk" },
  high:     { color: "var(--amber)", bg: "var(--amber-dim)", label: "High Risk" },
  medium:   { color: "var(--blue)", bg: "var(--blue-dim)", label: "Medium Risk" },
  low:      { color: "var(--teal)", bg: "var(--teal-dim)", label: "Low Risk" },
};

const CHANNELS = ["WhatsApp", "Email", "SMS", "Call"];

const FALLBACK_MESSAGE = `Dear Priya,

We value your relationship with Union Bank. We noticed some changes in your account activity recently and wanted to reach out personally.

As a valued customer of 6 years, we'd like to offer you:
• Priority relationship manager support
• Exclusive FD rates at 7.8% p.a.
• Zero-fee salary account upgrade

Your dedicated RM Anil Kapoor will call you this week. Meanwhile, feel free to reach out on our priority helpline.

Warm regards,
Union Bank Retention Team`;

const FALLBACK_BRIEF = [
  "Customer has been with the bank for 6 years — high lifetime value",
  "Salary credits stopped 2 months ago — possible job change",
  "3 complaints filed in last 30 days — urgent resolution needed",
  "FD of ₹4.2L matured and not renewed — risk of fund withdrawal",
  "Recommended: Offer priority RM + competitive FD rate to retain",
];

/* ══════════════════════════════════════════════════ */
const OutreachDrawer = ({ isOpen, onClose, customer }) => {
  const [selectedChannel, setSelectedChannel] = useState("WhatsApp");
  const [generating, setGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [fullMessage, setFullMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const typewriterRef = useRef(null);
  const bodyRef = useRef(null);

  /* ── Typewriter effect at 60fps (16ms interval) ── */
  const runTypewriter = useCallback((text) => {
    setDisplayedText("");
    setShowMessage(true);
    let idx = 0;
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    typewriterRef.current = setInterval(() => {
      idx++;
      setDisplayedText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 16);
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  /* reset when drawer closes */
  useEffect(() => {
    if (!isOpen) {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      setShowMessage(false);
      setDisplayedText("");
      setFullMessage("");
      setGenerating(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setGenerating(true);
    setShowMessage(false);
    setDisplayedText("");
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    try {
      const data = await generateMessage(customer?.id, selectedChannel);
      const msg = data?.message || data?.text || FALLBACK_MESSAGE;
      setFullMessage(msg);
      runTypewriter(msg);
    } catch {
      setFullMessage(FALLBACK_MESSAGE);
      runTypewriter(FALLBACK_MESSAGE);
    } finally {
      setGenerating(false);
    }
  };

  if (!customer) return null;

  const tier = customer.risk_tier || "critical";
  const tm = TIER_META[tier] || TIER_META.critical;
  const initials = (customer.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const briefPoints = customer.rm_brief || FALLBACK_BRIEF;
  const topFactor = (customer.shap_factors || [])[0]?.factor || "Salary credit stopped";

  return (
    <>
      {/* ═══════ OVERLAY ═══════ */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(8,12,18,0.82)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
      />

      {/* ═══════ DRAWER PANEL ═══════ */}
      <aside
        style={{
          position: "fixed", right: 0, top: 0, bottom: 0,
          width: 455,
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-hi)",
          zIndex: 201,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(.32,.72,0,1)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {/* Left: avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span
              className="ff-disp"
              style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: tm.bg, color: tm.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}
            >
              {initials}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="ff-disp" style={{ fontSize: 14, fontWeight: 700, color: "var(--txt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {customer.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span className="ff-mono" style={{ fontSize: 10, color: "var(--txt3)", letterSpacing: "0.3px" }}>
                  {customer.id} · {customer.account_type}
                </span>
                <TierBadge tier={tier} />
              </div>
            </div>
          </div>

          {/* Right: close button */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
              border: "1px solid var(--border-hi)", background: "transparent",
              color: "var(--txt3)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, lineHeight: 1, transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--red-dim)";
              e.currentTarget.style.borderColor = "var(--red)";
              e.currentTarget.style.color = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border-hi)";
              e.currentTarget.style.color = "var(--txt3)";
            }}
          >
            ✕
          </button>
        </div>

        {/* ── BODY (scrollable) ── */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>

          {/* Section 1: Risk Assessment */}
          <div
            style={{
              background: "var(--bg-elevated)", borderRadius: 9,
              padding: 16, marginBottom: 18,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="ff-disp" style={{ fontSize: 40, fontWeight: 800, color: tm.color, lineHeight: 1 }}>
                {customer.risk_score}
              </div>
              <div>
                <div className="ff-mono" style={{ fontSize: 8.5, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 3 }}>
                  Risk Score
                </div>
                <div className="ff-body" style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.5 }}>
                  Primary trigger: <strong style={{ color: "var(--txt)" }}>{topFactor}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: SHAP Factors */}
          <div style={{ marginBottom: 18 }}>
            <h4 className="ff-mono" style={{ margin: "0 0 10px", fontSize: 9, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--txt3)" }}>
              Risk Factors
            </h4>
            <ShapChart data={customer.shap_factors || []} />
          </div>

          {/* Section 3: RM Briefing */}
          <div
            style={{
              background: "var(--bg-elevated)", borderRadius: 9,
              padding: 16, marginBottom: 18,
              border: "1px solid var(--border)",
            }}
          >
            <h4 className="ff-mono" style={{ margin: "0 0 10px", fontSize: 9, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--txt3)" }}>
              RM Briefing
            </h4>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {briefPoints.map((pt, i) => (
                <li key={i} className="ff-body" style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.7, marginBottom: 4 }}>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Generate Message */}
          <div style={{ marginBottom: 18 }}>
            <h4 className="ff-mono" style={{ margin: "0 0 10px", fontSize: 9, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--txt3)" }}>
              Generate Outreach
            </h4>

            {/* Channel selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className="ff-mono"
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.5px",
                    padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                    border: selectedChannel === ch ? "1px solid var(--amber)" : "1px solid var(--border)",
                    background: selectedChannel === ch ? "var(--amber-dim)" : "transparent",
                    color: selectedChannel === ch ? "var(--amber)" : "var(--txt3)",
                    transition: "all 150ms",
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="ff-mono"
              style={{
                width: "100%", height: 40,
                borderRadius: 9, border: "none", cursor: generating ? "wait" : "pointer",
                background: "var(--amber)", color: "#080c12",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "filter 150ms, opacity 150ms",
                opacity: generating ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!generating) e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
            >
              {generating ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #080c12", borderRadius: "50%", animation: "outreach-spin 0.7s linear infinite" }} />
                  Generating via {selectedChannel}…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                  Generate {selectedChannel} Message
                </>
              )}
            </button>
          </div>

          {/* Section 5: Typewriter output */}
          {showMessage && (
            <div
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 9, padding: 16,
                animation: "outreach-fadeIn 0.3s ease both",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h4 className="ff-mono" style={{ margin: 0, fontSize: 9, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--teal)" }}>
                  Generated Message
                </h4>
                <span className="ff-mono" style={{ fontSize: 8.5, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  {selectedChannel}
                </span>
              </div>
              <div
                className="ff-body"
                style={{
                  fontSize: 12.5, lineHeight: 1.7, color: "var(--txt2)",
                  whiteSpace: "pre-wrap", minHeight: 60,
                }}
              >
                {displayedText}
                {displayedText.length < fullMessage.length && (
                  <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--amber)", marginLeft: 1, animation: "outreach-blink 0.6s step-end infinite" }} />
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── keyframes ── */}
      <style>{`
        @keyframes outreach-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes outreach-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes outreach-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default OutreachDrawer;
