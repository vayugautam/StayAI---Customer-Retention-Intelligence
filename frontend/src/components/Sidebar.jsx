import { NavLink } from "react-router-dom";

/* ── SVG icon paths ─────────────────────────────────── */
const icons = {
  shield:
    "M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z",
  dashboard:
    "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  customers:
    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  campaigns:
    "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z",
  analytics:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z",
  insights:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
  settings:
    "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z",
};

const navItems = [
  { to: "/", icon: icons.dashboard, label: "Dashboard" },
  { to: "/customer/overview", icon: icons.customers, label: "Customers" },
  { to: "/campaigns", icon: icons.campaigns, label: "Campaigns" },
  { to: "/analytics", icon: icons.analytics, label: "Analytics" },
  { to: "/insights", icon: icons.insights, label: "AI Insights" },
];

/* ── Component ──────────────────────────────────────── */
const Sidebar = () => {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 68,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 30,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          width: 38,
          height: 38,
          marginTop: 14,
          marginBottom: 18,
          borderRadius: 10,
          background: "var(--amber)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#080c12">
          <path d={icons.shield} />
        </svg>
        {/* ring */}
        <span
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 14,
            border: "1.5px solid rgba(245,166,35,0.28)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Nav links ── */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "center",
          flex: 1,
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            title={item.label}
            style={({ isActive }) => ({
              position: "relative",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              textDecoration: "none",
              background: isActive ? "var(--amber-dim)" : "transparent",
              transition: "background 150ms, color 150ms",
            })}
            className="sidebar-nav-item"
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: -1,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 18,
                      borderRadius: 999,
                      background: "var(--amber)",
                    }}
                  />
                )}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill={isActive ? "var(--amber)" : "var(--txt3)"}
                  style={{ transition: "fill 150ms" }}
                >
                  <path d={item.icon} />
                </svg>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom: Settings + live dot ── */}
      <div
        style={{
          marginBottom: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <NavLink
          to="/settings"
          title="Settings"
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            textDecoration: "none",
          }}
          className="sidebar-nav-item"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--txt3)">
            <path d={icons.settings} />
          </svg>
        </NavLink>

        {/* Live green dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--teal)",
            boxShadow: "0 0 7px var(--teal)",
            animation: "pulse-dot 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Scoped styles for hover + pulse animation */}
      <style>{`
        .sidebar-nav-item:hover {
          background: var(--border) !important;
        }
        .sidebar-nav-item:hover svg {
          fill: var(--txt2) !important;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
